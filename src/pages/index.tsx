import { useLoadingBackdrop } from '@/components/LoadingBackdrop'
import { JoinRoomForm, useJoinRoom } from '@/services/room/room'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

export default function Home() {
  const router = useRouter()
  const mutate = useJoinRoom()
  const { onShow, onClose } = useLoadingBackdrop()

  const { register, handleSubmit } = useForm<JoinRoomForm>()

  const handleJoinRoom = async ({ roomName, name }: JoinRoomForm) => {
    onShow()
    mutate.mutate(
      { roomName, name },
      {
        onSuccess: (res) => {
          router.push(`/meeting?token=${res.data.token}&room=${roomName}`)
        },
        onError: () => {
          alert('Room is duplicate')
        },
        onSettled: () => {
          onClose()
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit(handleJoinRoom)}
      className='m-auto max-w-3xl border h-[100svh] flex flex-col bg-[url("/images/background.jpg")] bg-center bg-cover'
    >
      <div className='w-full h-[10%] flex justify-center items-end'>
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
        <div className='nes-field'>
          <label htmlFor='name_field'>Room name</label>
          <input
            type='text'
            id='name_field'
            className='nes-input'
            {...register('roomName')}
          />
        </div>
        <div className='nes-field'>
          <label htmlFor='name_field'>Your name</label>
          <input
            type='text'
            id='name_field'
            className='nes-input'
            {...register('name')}
          />
        </div>
      </div>
      <div className='w-full h-[20%] flex justify-center items-center'>
        <button type='submit' className='nes-btn is-primary relative z-10'>
          Join Video
        </button>

        <div className='bg-blue-300 animate-ping absolute w-[110px] rounded-sm h-[34px] z-0' />
      </div>
    </form>
  )
}
