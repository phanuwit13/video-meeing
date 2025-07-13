import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import Video from 'twilio-video'
type Props = {}

const Participant = ({
  participant,
  type,
}: {
  participant: any
  type: 'seconds' | 'first'
}) => {
  const [videoTracks, setVideoTracks] = useState<any>([])
  const [audioTracks, setAudioTracks] = useState<any>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLVideoElement>(null)

  const trackpubsToTracks = (
    trackMap: Map<string, Video.RemoteVideoTrackPublication>
  ) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)

  useEffect(() => {
    const trackSubscribed = (track: Video.RemoteTrack) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks: any) => [...videoTracks, track])
      } else {
        setAudioTracks((audioTracks: any) => [...audioTracks, track])
      }
    }

    const trackUnsubscribed = (track: Video.RemoteTrack) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks: any) =>
          videoTracks.filter((v: any) => v !== track)
        )
      } else {
        setAudioTracks((audioTracks: any) =>
          audioTracks.filter((a: any) => a !== track)
        )
      }
    }
    setVideoTracks(trackpubsToTracks(participant.videoTracks))
    setAudioTracks(trackpubsToTracks(participant.audioTracks))

    participant.on('trackSubscribed', trackSubscribed)
    participant.on('trackUnsubscribed', trackUnsubscribed)

    return () => {
      setVideoTracks([])
      setAudioTracks([])
      participant.removeAllListeners()
    }
  }, [participant])

  useEffect(() => {
    const videoTrack = videoTracks[0] as any
    if (videoTrack) {
      videoTrack.attach(videoRef.current)
      return () => {
        videoTrack.detach()
      }
    }
  }, [videoTracks])

  useEffect(() => {
    const audioTrack = audioTracks[0] as any
    if (audioTrack) {
      audioTrack.attach(audioRef.current)
      return () => {
        audioTrack.detach()
      }
    }
  }, [audioTracks])

  return (
    <>
      <div
        className={classNames(
          'w-full object-contain overflow-hidden min-h-[610px] flex items-center relative',
          {
            '!w-auto !min-h-[unset] !fixed !bottom-0 !right-0 !aspect-[80/106] !h-[200px]':
              type === 'seconds',
          }
        )}
      >
        <div className='bg-gray-50 blur-sm opacity-[0.3] absolute top-0 h-full w-full'></div>
        <video
          className='scale-x-[-1] m-auto object-cover w-full aspect-[3/4] max-h-[610px]'
          ref={videoRef}
          autoPlay={true}
        />
      </div>
      <audio ref={audioRef} autoPlay={true} muted={false} />
    </>
  )
}

const MeetingPage = (props: Props) => {
  const { query, push } = useRouter()

  const [room, setRoom] = useState<Video.Room | null>(null)
  const [participants, setParticipants] = useState<Video.RemoteParticipant[]>(
    []
  )

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

  return (
    <div className='room m-auto max-w-3xl border h-[100svh] flex flex-col bg-[url("/images/background.jpg")] bg-center bg-cover'>
      <h2>Room: {query.room}</h2>
      <h3>
        Call With : {Boolean(remoteParticipantsName) && remoteParticipantsName}
      </h3>
      <div className='remote-participants'>{remoteParticipants}</div>
      <div className='local-participant w-[80px] absolute bottom-0 h-[100px] right-0'>
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
            type='seconds'
          />
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default MeetingPage
