import Participant from '@/components/Meeting/Participant'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Video from 'twilio-video'

const MeetingPage = () => {
  const { query, push } = useRouter()

  const [room, setRoom] = useState<Video.Room | null>(null)
  const [participants, setParticipants] = useState<Video.RemoteParticipant[]>(
    []
  )

  const remoteParticipants = useMemo(() => {
    const participant = [...participants].pop()
    return (
      Boolean(participants.length) && (
        <Participant
          type='first'
          key={participant?.sid}
          participant={participant}
        />
      )
    )
  }, [participants.length])

  const remoteParticipantsName = useMemo(() => {
    return [...participants].pop()?.identity
  }, [participants.length])

  useEffect(() => {
    const participantConnected = (participant: Video.RemoteParticipant) => {
      setParticipants((prevParticipants) => [...prevParticipants, participant])
    }
    const participantDisconnected = (participant: Video.RemoteParticipant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      )
    }
    if (query.token) {
      Video.connect(query.token.toString(), {
        name: query.room?.toString(),
      })
        .then((room) => {
          setRoom(room)
          room.on('participantConnected', participantConnected)
          room.on('participantDisconnected', participantDisconnected)
          room.participants.forEach(participantConnected)
        })
        .catch((err) => {
          alert(err)
          push('/')
        })
    }

    return () => {
      setRoom((currentRoom) => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function (
            trackPublication: any
          ) {
            trackPublication.track.stop()
          })
          currentRoom.disconnect()
          return null
        } else {
          return currentRoom
        }
      })
    }
  }, [query.room, query.token])

  return (
    <div className='room m-auto max-w-3xl border h-[100svh] flex flex-col bg-[url("/images/background.jpg")] bg-center bg-cover'>
      <h2>Room: {query.room}</h2>
      <h3>
        Call With : {Boolean(remoteParticipantsName) && remoteParticipantsName}
      </h3>
      <div className='remote-participants'>{remoteParticipants}</div>
      <div className='local-participant w-[80px] absolute bottom-0 h-[100px] right-0'>
        {room && (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
            type='seconds'
          />
        )}
      </div>
    </div>
  )
}

export default MeetingPage
