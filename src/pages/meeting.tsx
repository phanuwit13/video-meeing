import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import Video from 'twilio-video'
type Props = {}

const Participant = ({ participant }: { participant: any }) => {
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

  return (
    <div className='participant'>
      <h3>{participant.identity}</h3>
      <video ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} muted={true} />
    </div>
  )
}

const MeetingPage = (props: Props) => {
  const { query } = useRouter()

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
      }).then((room) => {
        setRoom(room)
        room.on('participantConnected', participantConnected)
        room.on('participantDisconnected', participantDisconnected)
        room.participants.forEach(participantConnected)
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

  const remoteParticipants = participants.map((participant) => (
    <Participant key={participant.sid} participant={participant} />
  ))

  return (
    <div className='room'>
      <h2>Room: {query.room}</h2>
      {/* <button onClick={handleLogout}>Log out</button> */}
      <div className='local-participant'>
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        ) : (
          ''
        )}
      </div>
      <h3>Remote Participants</h3>
      <div className='remote-participants'>{remoteParticipants}</div>
    </div>
  )
}

export default MeetingPage
