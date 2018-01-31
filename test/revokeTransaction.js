const $util = require("./util")
const InkProtocol = artifacts.require("./mocks/InkProtocolMock.sol")

contract("InkProtocol", (accounts) => {
  let buyer = accounts[1]
  let seller = accounts[2]
  let unknown = accounts[accounts.length - 1]

  describe("#revokeTransaction()", () => {
    it("fails for seller", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller)

      await $util.assertVMExceptionAsync(protocol.revokeTransaction(transaction.id, { from: seller }))
    })

    it("fails for owner", async () => {
      let {
        protocol,
        transaction,
        owner
      } = await $util.buildTransaction(buyer, seller, {
        owner: true
      })

      await $util.assertVMExceptionAsync(owner.proxyRevokeTransaction(protocol.address, transaction.id))
    })

    it("fails for mediator", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller)

      await $util.assertVMExceptionAsync(mediator.proxyRevokeTransaction(protocol.address, transaction.id))
    })

    it("fails for policy", async () => {
      let {
        protocol,
        transaction,
        policy
      } = await $util.buildTransaction(buyer, seller)

      await $util.assertVMExceptionAsync(policy.proxyRevokeTransaction(protocol.address, transaction.id))
    })

    it("fails for unknown address", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller)

      await $util.assertVMExceptionAsync(protocol.revokeTransaction(transaction.id, { from: unknown }))
    })

    it("fails when transaction does not exist", async () => {
      let protocol = await InkProtocol.new()

      await $util.assertVMExceptionAsync(protocol.revokeTransaction(0))
    })

    it("fails when transaction is not Initiated state", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Accepted
      })

      await $util.assertVMExceptionAsync(protocol.revokeTransaction(transaction.id, { from: buyer }))
    })

    it("emits the TransactionRevoked event", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller)

      let tx = await protocol.revokeTransaction(transaction.id, { from: buyer })
      let eventArgs = $util.eventFromTx(tx, $util.events.TransactionRevoked).args

      assert.equal(eventArgs.id, transaction.id)
    })

    it("transfers tokens from escrow back to the buyer (and only buyer)", async () => {
      let amount = 100
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, { amount })

      assert.equal(await $util.getBalance(protocol.address, protocol), amount)
      assert.equal(await $util.getBalance(buyer, protocol), 0)

      let tx = await protocol.revokeTransaction(transaction.id, { from: buyer })

      assert.equal(await $util.getBalance(protocol.address, protocol), 0)
      assert.equal(await $util.getBalance(buyer, protocol), amount)
    })

    it("fails when acceptTransaction is called afterwards", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller)

      await protocol.acceptTransaction(transaction.id, { from: seller })
      await $util.assertVMExceptionAsync(protocol.revokeTransaction(transaction.id, { from: buyer }))
    })
  })
})
