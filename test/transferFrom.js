const $util = require("./util")
const InkProtocol = artifacts.require("./mocks/InkProtocolMock.sol")

contract("InkProtocol", (accounts) => {
  let protocol
  let sender = accounts[1]
  let recipient = accounts[2]
  let agent = accounts[3]

  beforeEach(async () => {
    protocol = await InkProtocol.new()
  })

  describe("#transferFrom()", () => {
    it("fails when recipient is the protocol", async () => {
      await $util.assertVMExceptionAsync(protocol.transferFrom(sender, protocol.address, 1))
    })

    it("succeeds when recipient is another address", async () => {
      let amount = 10;
      await protocol.transfer(sender, 20)
      senderBalance = await $util.getBalance(sender, protocol)
      assert.equal(await $util.getBalance(sender, protocol), 20)

      await protocol.approve(agent, amount, { from: sender })
      await protocol.transferFrom(sender, recipient, amount, { from: agent })

      assert.equal(await $util.getBalance(sender, protocol), senderBalance - amount)
      assert.equal(await $util.getBalance(recipient, protocol), amount)
    })
  })
})
