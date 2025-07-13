import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import Video from 'twilio-video'
type ParticipantProps = {
  participant: any
  type: 'seconds' | 'first'
}

const Participant = ({ participant, type }: ParticipantProps) => {
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

export default Participant
