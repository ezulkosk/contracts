pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20/TokenVesting.sol';
import './InkProtocolCore.sol';

/// @title Ink Protocol: Decentralized reputation and payments for peer-to-peer marketplaces.
contract InkProtocol is InkProtocolCore {
  // Allocation addresses.
  address public constant __address1__ = 0x0;
  address public constant __address2__ = 0x0;
  address public constant __address3__ = 0x0;
  address public constant __address4__ = 0x0;

  /*
    Constructor for Mainnet.
  */

  function InkProtocol() public {
    uint256 allocated;

    // Allocate 32% to vesting contract for Ink distribution/network incentives.
    // Vesting starts Feb 28, 2018 @ 00:00:00 GMT
    TokenVesting vesting1 = new TokenVesting(__address1__, 1519776000, 0, 3 years, false);
    balances[vesting1] = 160000000000000000000000000;
    allocated = allocated.add(balanceOf(vesting1));

    // Allocate 32% to vesting contract for Listia Inc.
    // Vesting starts Feb 28, 2018 @ 00:00:00 GMT
    TokenVesting vesting2 = new TokenVesting(__address2__, 1519776000, 0, 3 years, false);
    balances[vesting2] = 160000000000000000000000000;
    allocated = allocated.add(balanceOf(vesting2));

    // Allocate 6% to wallet for Listia Marketplace credit conversion.
    balances[__address3__] = 30000000000000000000000000;
    allocated = allocated.add(balanceOf(__address3__));

    // Allocate to wallet for token sale distribution.
    balances[__address4__] = 130374026302104500000000000;
    allocated = allocated.add(balanceOf(__address4__));

    // Burn unsold tokens due to token sale hard cap.
    uint256 burnedSupply = 19625973697895500000000000;
    totalSupply_ = totalSupply_.sub(burnedSupply);

    assert(totalSupply_ == allocated);
  }
}
