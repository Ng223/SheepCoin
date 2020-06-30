pragma solidity >=0.5.16;

contract SheepCoin {
			address payable public admin;
			string  public name = "SheepCoin";
	    string  public symbol = "BAA";
	    uint256 public totalSupply;

	    event Transfer(
	        address indexed _from,
	        address indexed _to,
	        uint256 _value
	    );

	    event Approval(
	        address indexed _owner,
	        address indexed _spender,
	        uint256 _value
	    );

	    mapping(address => uint256) public balanceOf;
	    mapping(address => mapping(address => uint256)) public allowance;

			 constructor(uint256 _initialSupply) public {
				admin = msg.sender;
			 	totalSupply = _initialSupply;
				balanceOf[admin] = totalSupply;
			 }

	    function transfer(address _to, uint256 _value) public returns (bool success) {
	        require(balanceOf[msg.sender] >= _value);

	        balanceOf[msg.sender] -= _value;
	        balanceOf[_to] += _value;

	        emit Transfer(msg.sender, _to, _value);

	        return true;
	    }

	    function approve(address _spender, uint256 _value) public returns (bool success) {
	        allowance[msg.sender][_spender] = _value;

	        emit Approval(msg.sender, _spender, _value);

	        return true;
	    }

	    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
	        require(_value <= balanceOf[_from]);
	        require(_value <= allowance[_from][msg.sender]);

	        balanceOf[_from] -= _value;
	        balanceOf[_to] += _value;

	        allowance[_from][msg.sender] -= _value;

	        emit Transfer(_from, _to, _value);

	        return true;
	    }
}
