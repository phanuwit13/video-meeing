import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  const handleJoinRoom = async () => {
    const res = await axios.post('https://crawling-ruddy-aster.glitch.me/join-room', {
      roomName: 'meeting',
    })
    console.log('res', res)
    if (res) {
      router.push(`/meeting?token=${res.data.token}&room=meeting`)
    }
  }

  return (
    <div className='m-auto max-w-3xl border h-screen flex flex-col bg-[url("/images/background.jpg")] bg-center bg-cover'>
      <div className='w-full h-[10%] flex justify-center items-center'>
        <span className='text-[18px] text-white'>Video Online Meeting</span>
      </div>
      <div className='w-full h-[70%] flex justify-center items-center flex-col gap-5'>
        <Image
          src='/images/live.png'
          width={120}
          height={60}
          alt='live image'
          className='animate-bounce'
        />
        {/* <i className='nes-icon youtube is-large'></i> */}
      </div>
      <div className='w-full h-[20%] flex justify-center items-center'>
        <button
          onClick={handleJoinRoom}
          type='button'
          className='nes-btn is-primary relative z-10'
        >
          Join Video
        </button>

        <div className='bg-blue-300 animate-ping absolute w-[110px] rounded-sm h-[34px] z-0' />
      </div>
    </div>
  )
}
