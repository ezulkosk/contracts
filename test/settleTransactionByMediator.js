const $util = require("./util")
const InkProtocol = artifacts.require("./mocks/InkProtocolMock.sol")

contract("InkProtocol", (accounts) => {
  let buyer = accounts[1]
  let seller = accounts[2]
  let unknown = accounts[accounts.length - 1]
  let buyerAmount = 50
  let sellerAmount = 50

  describe("#settleTransactionByMediator()", () => {
    it("fails for buyer", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await $util.assertVMExceptionAsync(protocol.settleTransactionByMediator(transaction.id, buyerAmount, sellerAmount, { from: buyer }))
    })

    it("fails for seller", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await $util.assertVMExceptionAsync(protocol.settleTransactionByMediator(transaction.id, buyerAmount, sellerAmount, { from: seller }))
    })

    it("fails for owner", async () => {
      let {
        protocol,
        transaction,
        owner
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated,
        owner: true
      })

      await $util.assertVMExceptionAsync(owner.proxySettleTransactionByMediator(protocol.address, transaction.id, buyerAmount, sellerAmount))
    })

    it("fails for policy", async () => {
      let {
        protocol,
        transaction,
        policy
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated,
        owner: true
      })

      await $util.assertVMExceptionAsync(policy.proxySettleTransactionByMediator(protocol.address, transaction.id, buyerAmount, sellerAmount))
    })

    it("fails for unknown address", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await $util.assertVMExceptionAsync(protocol.settleTransactionByMediator(transaction.id, buyerAmount, sellerAmount, { from: unknown }))
    })

    it("fails when transaction does not exist", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await $util.assertVMExceptionAsync(mediator.settleTransaction(protocol.address, transaction.id + 1, buyerAmount, sellerAmount))
    })

    it("fails when buyerAmount and sellerAmount does not add up to transaction amount", async () => {
      let totalAmount = 100
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated,
        amount: totalAmount
      })

      let buyerAmount = 49
      let sellerAmount = 50

      await $util.assertVMExceptionAsync(mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount))
    })

    it("fails when mediator raises an error", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await mediator.setRaiseError(true)

      await $util.assertVMExceptionAsync(mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount))
    })

    it("fails when mediator returns a buyer's fee that is greater than buyer's amount", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await mediator.setSettleTransactionByMediatorFeeResponseForBuyer(buyerAmount + 1)
      await $util.assertVMExceptionAsync(mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount))
    })

    it("fails when mediator returns a seller's fee that is greater than seller's amount", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      await mediator.setSettleTransactionByMediatorFeeResponseForSeller(sellerAmount + 1)
      await $util.assertVMExceptionAsync(mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount))
    })

    it("passes the buyer's and seller's amount to the mediator", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      let tx = await mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount)
      let event = await $util.eventFromContract(protocol, $util.events.TransactionSettledByMediator)
      let eventArgs = event.args

      assert.equal(eventArgs.id, transaction.id)
      assert.equal(eventArgs.buyerAmount, buyerAmount)
      assert.equal(eventArgs.sellerAmount, sellerAmount)
    })

    it("transfers the mediator fees to the mediator", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })
      let buyerAmountFee = 1
      let sellerAmountFee = 1

      await mediator.setSettleTransactionByMediatorFeeResponseForBuyer(buyerAmountFee)
      await mediator.setSettleTransactionByMediatorFeeResponseForSeller(sellerAmountFee)

      await mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount)

      assert.equal((await protocol.balanceOf.call(mediator.address)).toNumber(), buyerAmountFee + sellerAmountFee)
    })

    it("transfers the tokens to the seller", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })
      let sellerAmountFee = 1

      await mediator.setSettleTransactionByMediatorFeeResponseForSeller(sellerAmountFee)
      await mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount)

      assert.equal((await protocol.balanceOf.call(seller)).toNumber(), sellerAmount - sellerAmountFee)
    })

    it("transfers the tokens to the buyer", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })
      let buyerAmountFee = 1

      await mediator.setSettleTransactionByMediatorFeeResponseForBuyer(buyerAmountFee)
      await mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount)

      assert.equal((await protocol.balanceOf.call(buyer)).toNumber(), buyerAmount - buyerAmountFee)
    })

    it("emits the TransactionSettledByMediator event", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Escalated
      })

      let tx = await mediator.settleTransaction(protocol.address, transaction.id, buyerAmount, sellerAmount)
      let events = await $util.eventsFromContract(protocol, $util.events.TransactionSettledByMediator)

      assert.equal(events.length, 1)
    })
  })
})
