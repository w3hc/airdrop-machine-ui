import { Text, Button, useToast, FormControl, FormLabel, Input, FormHelperText, Textarea } from '@chakra-ui/react'
import { Head } from 'components/layout/Head'
import { LinkComponent } from 'components/layout/LinkComponent'
import { useState, useEffect } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { ethers } from 'ethers'
import { useEthersSigner, useEthersProvider } from '../hooks/ethersAdapter'
import { AIRDROP_MACHINE_ADDRESS, TOKEN_ADDRESS, TOKEN_ABI, AIRDROP_ABI } from '../utils/config'

export default function Home() {
  const { chains, error, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { address, isConnected, isDisconnected } = useAccount()
  const { chain } = useNetwork()
  const provider = useEthersProvider()
  const signer = useEthersSigner()
  const toast = useToast()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [amount, setAmount] = useState('1')
  const [tokenAddress, setTokenAddress] = useState(TOKEN_ADDRESS)
  const [targets, setTargets] = useState<any>(['0xD8a394e7d7894bDF2C57139fF17e5CBAa29Dd977'])

  useEffect(() => {
    const init = async () => {
      if (chain?.id !== 10243) {
        switchNetwork?.(10243)
      }
    }
    init()
    console.log('targets:', targets)
    console.log('isConnected:', isConnected)
    console.log('network:', chain?.name)
    console.log('signer:', signer)
    console.log('provider:', provider)
  }, [signer])

  const airdrop = async () => {
    try {
      if (!signer) {
        toast({
          title: 'No wallet',
          description: 'Please connect your wallet first.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      setIsLoading(true)
      setTxHash('')
      setTxLink('')

      console.log('tokenAddress:', tokenAddress)
      const token = new ethers.Contract(tokenAddress, TOKEN_ABI, signer)
      const airdrop = new ethers.Contract(AIRDROP_MACHINE_ADDRESS, AIRDROP_ABI, signer)

      const from = address

      console.log('targets.length:', targets.length)
      if (targets.length < 85) {
        toast({
          title: 'Add another address',
          description: 'You cannot send to only one address.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })
        setIsLoading(false)
        return
      }
      const myArray = targets.split(',')
      console.log('Array(targets):', Array(targets))
      console.log('myArray:', myArray)
      console.log('myArray.length:', myArray.length)

      const amountFormatted = Number(amount)
      const goodAmount = ethers.parseEther(String(amountFormatted))
      console.log('amount', amount)
      console.log('amountFormatted', amountFormatted)
      const total = amountFormatted * myArray.length

      const approve = await token.approve(AIRDROP_MACHINE_ADDRESS, ethers.parseEther(String(total)))
      const receipt = await approve.wait()
      console.log('approve tx:', receipt)

      // https://explorer-test.arthera.net/tx/0xbf8d63de8e825e5edd8a28763544faf70393146ef17b1c0aab75948c9e1b08a7
      const airdropCall = await airdrop.distribute(from, myArray, goodAmount, tokenAddress)
      const airdropCallReceipt = await airdropCall.wait(1)
      console.log('airdrop call tx:', airdropCallReceipt)

      setTxHash(airdropCallReceipt.hash)
      setTxLink('https://explorer-test.arthera.net/tx/' + airdropCallReceipt.hash)
      setIsLoading(false)
      toast({
        title: 'Aidrop successful',
        description: 'You just airdropped your tokens! 🎉',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
    } catch (e) {
      setIsLoading(false)
      console.log('error:', e)
      toast({
        title: 'Woops',
        description: 'Something went wrong:' + e,
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Head />

      <main>
        {/* <HeadingComponent as="h2">Welcome! 👋</HeadingComponent> */}
        <FormControl>
          <FormLabel>Token address</FormLabel>
          <Input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="1" />
          <FormHelperText>What&apos;s the address of the token (ERC-20) you want to distribute?</FormHelperText>
          <br />
          <FormLabel>Amount of tokens per wallet</FormLabel>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1" />
          <FormHelperText>How much do you want to airdrop to each address?</FormHelperText>
          <br />
          <FormLabel>Target wallet addresses (1000 addresses max)</FormLabel>
          <Textarea value={targets} onChange={(e) => setTargets(e.target.value)} placeholder={targets} />
          <FormHelperText>
            Who should be the recipients? These wallet address must be separated by a comma, and there must be at least 2 addresses.
          </FormHelperText>
        </FormControl>
        <Button
          mt={4}
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={airdrop}
          isLoading={isLoading}
          loadingText="Airdropping..."
          spinnerPlacement="end">
          Airdop now
        </Button>
        {txHash && (
          <Text py={4} fontSize="14px" color="#45a2f8">
            <LinkComponent href={txLink ? txLink : ''}>{txHash}</LinkComponent>
          </Text>
        )}
      </main>
    </>
  )
}
