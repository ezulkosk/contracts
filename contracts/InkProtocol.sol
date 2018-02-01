pragma solidity ^0.4.11;

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
    // Burn unsold tokens due to token sale hard cap.
    uint256 burnedSupply = 19625973697895500000000000;
    totalSupply_ = totalSupply_.sub(burnedSupply);

    // Allocate 32% to vesting contract for Ink distribution/network incentives.
    balances[__address1__] = 160000000000000000000000000;
    Transfer(address(0), __address1__, balanceOf(__address1__));

    // Allocate 32% to vesting contract for Listia Inc.
    balances[__address2__] = 160000000000000000000000000;
    Transfer(address(0), __address2__, balanceOf(__address2__));

    // Allocate 6% to wallet for Listia Marketplace credit conversion.
    balances[__address3__] = 30000000000000000000000000;
    Transfer(address(0), __address3__, balanceOf(__address3__));

    // Allocate to wallet for token sale distribution.
    balances[__address4__] = 130374026302104500000000000;
    Transfer(address(0), __address4__, balanceOf(__address4__));
  }
}
