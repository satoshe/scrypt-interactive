const fs = require('fs')
const tape = require('tape')
const spawn = require('tape-spawn')
const Web3 = require('web3')

// these can be generated by running the compile function
var runnerCode = "0x6060604052341561000f57600080fd5b5b61140d8061001f6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063194e10ce1461003e575b600080fd5b341561004957600080fd5b6100a2600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001909190505061011e565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100e35780820151818401525b6020810190506100c7565b50505050905090810190601f1680156101105780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101266112ee565b61012e611302565b610136611333565b60006101418661019c565b9250600090505b8460018201101561016c5761015e8382846101c7565b5b8080600101915050610148565b600182600001901515908115158152505061018b8360018301846101c7565b816020015193505b50505092915050565b6101a4611302565b6101b082836080610337565b81600001819052506101c1816104d7565b5b919050565b6000806000806000610800871015156101df57600080fd5b60008714156101fe576101f98860008a6000015189610505565b61032c565b6104008710156102325761021588600001516105c3565b886000018190525061022d88888a6000015189610505565b61032b565b6104007c01000000000000000000000000000000000000000000000000000000008960000151600260048110151561026657fe5b602002015181151561027457fe5b0481151561027e57fe5b06945061028c888688610683565b9350935093509350610322608060405190810160405280868b6000015160006004811015156102b757fe5b6020020151188152602001858b6000015160016004811015156102d657fe5b6020020151188152602001848b6000015160026004811015156102f557fe5b6020020151188152602001838b60000151600360048110151561031457fe5b6020020151188152506105c3565b88600001819052505b5b5b5050505050505050565b61033f611355565b6103476112ee565b6000600485510160405180591061035b5750595b908082528060200260200182016040525b509150600090505b845181101561042257848181518110151561038b57fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f01000000000000000000000000000000000000000000000000000000000000000282828151811015156103e457fe5b9060200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053505b8080600101915050610374565b600090505b836020820210156104cd57600181017f01000000000000000000000000000000000000000000000000000000000000000282600184510381518110151561046a57fe5b9060200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506104a486836106ec565b6001900483826004811015156104b657fe5b6020020181815250505b8080600101915050610427565b5b50509392505050565b6110006040518059106104e75750595b908082528060200260200182016040525b5081604001819052505b50565b600061050f61137d565b6000806000806104008910151561052557600080fd5b8860040295508960400151945087600060048110151561054157fe5b602002015188600160048110151561055557fe5b602002015189600260048110151561056957fe5b60200201518a600360048110151561057d57fe5b6020020151935093509350935060208601955083868601526020860195508286860152602086019550818686015260208601955080868601525b50505050505050505050565b6105cb611355565b6000806000808560006004811015156105e057fe5b60200201518660016004811015156105f457fe5b602002015187600260048110151561060857fe5b602002015188600360048110151561061c57fe5b60200201519350935093509350610637828518828518610a75565b809450819550505061064d828518828518610a75565b80925081935050506080604051908101604052808581526020018481526020018381526020018281525094505b50505050919050565b600080600080600061069361137d565b610400881015156106a357600080fd5b876004029150886040015190506020820191508181015195506020820191508181015194506020820191508181015193506020820191508181015192505b505093509350935093565b600080600080600080604088511115610793576002886000604051602001526040518082805190602001908083835b60208310151561074157805182525b60208201915060208101905060208303925061071b565b6001836020036101000a03801982511681845116808217855250505050505090500191505060206040518083038160008661646e5a03f1151561078357600080fd5b5050604051805190509450610900565b600092505b8751831080156107a85750602083105b156108495782601f0360080260020a88848151811015156107c557fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f0100000000000000000000000000000000000000000000000000000000000000027f0100000000000000000000000000000000000000000000000000000000000000900402600102851794505b8280600101935050610798565b602092505b87518310801561085e5750604083105b156108ff5782603f0360080260020a888481518110151561087b57fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f0100000000000000000000000000000000000000000000000000000000000000027f0100000000000000000000000000000000000000000000000000000000000000900402600102841793505b828060010193505061084e565b5b7f363636363636363636363636363636363636363636363636363636363636363660010291507f5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c6001029050600285821885831860028886188887188c600060405160200152604051808460001916600019168152602001836000191660001916815260200182805190602001908083835b6020831015156109b857805182525b602082019150602081019050602083039250610992565b6001836020036101000a038019825116818451168082178552505050505050905001935050505060206040518083038160008661646e5a03f115156109fc57600080fd5b50506040518051905060006040516020015260405180846000191660001916815260200183600019166000191681526020018260001916600019168152602001935050505060206040518083038160008661646e5a03f11515610a5e57600080fd5b50506040518051905095505b505050505092915050565b6000806000806000869250859150600090505b6008811015610ac157610a9b8383610b38565b8093508194505050610aad8383610ef9565b80935081945050505b600281019050610a88565b600090505b6008811015610b2d57610af3610adc8483611200565b610ae68984611200565b0163ffffffff1682611223565b85179450610b1b610b048383611200565b610b0e8884611200565b0163ffffffff1682611223565b841793505b8080600101915050610ac6565b5b5050509250929050565b600080600080600080610bcd7c010000000000000000000000000000000000000000000000000000000089811515610b6c57fe5b046c010000000000000000000000008a811515610b8557fe5b047c01000000000000000000000000000000000000000000000000000000008a811515610bae57fe5b046c010000000000000000000000008b811515610bc757fe5b0461123d565b93509350935093506c010000000000000000000000008363ffffffff16027c01000000000000000000000000000000000000000000000000000000008563ffffffff16021795506c010000000000000000000000008163ffffffff16027c01000000000000000000000000000000000000000000000000000000008363ffffffff1602179450610ccf6801000000000000000089811515610c6a57fe5b04780100000000000000000000000000000000000000000000000089811515610c8f57fe5b04680100000000000000008a811515610ca457fe5b0478010000000000000000000000000000000000000000000000008c811515610cc957fe5b0461123d565b8094508195508296508397505050505078010000000000000000000000000000000000000000000000008163ffffffff1602680100000000000000008563ffffffff16021786179550680100000000000000008263ffffffff160278010000000000000000000000000000000000000000000000008463ffffffff16021785179450610dbd7401000000000000000000000000000000000000000088811515610d7457fe5b0464010000000089811515610d8557fe5b04740100000000000000000000000000000000000000008b811515610da657fe5b046401000000008c811515610db757fe5b0461123d565b809450819550829650839750505050506401000000008163ffffffff1602740100000000000000000000000000000000000000008363ffffffff160217861795506401000000008363ffffffff1602740100000000000000000000000000000000000000008563ffffffff16021785179450610e8b600188811515610e3e57fe5b047001000000000000000000000000000000008a811515610e5b57fe5b0460018b811515610e6857fe5b047001000000000000000000000000000000008b811515610e8557fe5b0461123d565b8094508195508296508397505050505060018263ffffffff16027001000000000000000000000000000000008463ffffffff160217861795507001000000000000000000000000000000008163ffffffff160260018563ffffffff160217851794505b505050509250929050565b600080600080600080610f967c010000000000000000000000000000000000000000000000000000000089811515610f2d57fe5b0478010000000000000000000000000000000000000000000000008a811515610f5257fe5b04740100000000000000000000000000000000000000008b811515610f7357fe5b047001000000000000000000000000000000008c811515610f9057fe5b0461123d565b93509350935093508063ffffffff166401000000008363ffffffff166401000000008663ffffffff166401000000008963ffffffff1602170217021795506110286801000000000000000089811515610feb57fe5b046401000000008a811515610ffc57fe5b0460018b81151561100957fe5b046c010000000000000000000000008c81151561102257fe5b0461123d565b809750819450829550839650505050508063ffffffff166401000000008363ffffffff166401000000008663ffffffff166401000000008963ffffffff166401000000008d0217021702170217955061110b740100000000000000000000000000000000000000008881151561109a57fe5b04700100000000000000000000000000000000898115156110b757fe5b047c01000000000000000000000000000000000000000000000000000000008a8115156110e057fe5b0478010000000000000000000000000000000000000000000000008b81151561110557fe5b0461123d565b809650819750829450839550505050508063ffffffff166401000000008363ffffffff166401000000008663ffffffff166401000000008963ffffffff1602170217021794506111a560018881151561116057fe5b046c010000000000000000000000008981151561117957fe5b04680100000000000000008a81151561118e57fe5b046401000000008b81151561119f57fe5b0461123d565b809550819650829750839450505050508063ffffffff166401000000008363ffffffff166401000000008663ffffffff166401000000008963ffffffff166401000000008c021702170217021794505b505050509250929050565b60006020808302610100030360020a8381151561121957fe5b0490505b92915050565b60006020808302610100030360020a830290505b92915050565b6000806000806000858901905063020000008163ffffffff1681151561125f57fe5b046080820217881897508888019050628000008163ffffffff1681151561128257fe5b04610200820217871896508787019050620800008163ffffffff168115156112a657fe5b046120008202178618955086860190506140008163ffffffff168115156112c957fe5b0462040000820217891898508888888894509450945094505b50945094509450949050565b602060405190810160405280600081525090565b60c060405190810160405280611316611391565b81526020016000801916815260200161132d6113b9565b81525090565b604080519081016040528060001515815260200161134f6113cd565b81525090565b6080604051908101604052806004905b60008152602001906001900390816113655790505090565b602060405190810160405280600081525090565b6080604051908101604052806004905b60008152602001906001900390816113a15790505090565b602060405190810160405280600081525090565b6020604051908101604052806000815250905600a165627a7a723058204a1f199b7324e0ebc629690e7ee3cad427ccb8029a80ef4ac228d09e6496d1740029"
var runnerABI = [{"constant":true,"inputs":[{"name":"input","type":"bytes"},{"name":"upToStep","type":"uint256"}],"name":"run","outputs":[{"name":"proof","type":"bytes"}],"payable":false,"stateMutability":"pure","type":"function"}]
function compile() {
    const solc = require('solc')
    function readFile(name) {
        return fs.readFileSync(name, {encoding: 'utf-8'})
    }

    const compilerInput = {
        'language': 'Solidity',
        'sources': {
        'scryptFramework.sol': {'content': readFile('contracts/scryptFramework.sol')},
        'scryptRunner.sol': {'content': readFile('contracts/scryptRunner.sol')}
        }
    }
    var results = JSON.parse(solc.compileStandard(JSON.stringify(compilerInput)))
    runnerCode = results['contracts']['scryptRunner.sol']['ScryptRunner']['evm']['bytecode']['object']
    runnerABI = '0x'+ results['contracts']['scryptRunner.sol']['ScryptRunner']['abi']
    console.log('var runnerCode = "' + runnerCode + '"')
    console.log('var runnerABI = ' + JSON.stringify(runnerABI) + '')
}
//compile()

/* start geth using

geth --dev --rpc

then use 'geth attach' with
var account = personal.newAccount('')
miner.setEtherbase(x)
miner.start()
*/
// Needs to be done every time: personal.unlockAccount(account)

var account = '0x3e345cbf6b07856e6028a27705418835cf636f1b'
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
//console.log(web3)
web3.eth.getBlockNumber()
.then(function (block) {
    console.log("At block " + block)
    return new web3.eth.Contract(runnerABI).deploy({data: runnerCode}).send({
        from: account,
        gas: 4000000
    })
})
.then(function (runner) {
    console.log(runner)
})

//var runner = new web3.eth.Contract()


// tape('Run', function (t) {
//   t.test('run', function (st) {
//       solc.com

//     var spt = spawn(st, './solcjs --version')
//     spt.stdout.match(RegExp(pkg.version + '(-[^a-zA-A0-9.+]+)?(\\+[^a-zA-Z0-9.-]+)?'))
//     spt.end()
//   })

// })
