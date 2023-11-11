import { apiClient } from '@/utils/api'
import { useMutation } from '@tanstack/react-query'
import { RoomResponse } from '@/services/room/room.type'

export interface JoinRoomForm {
  roomName: string
  name: string
}

export const useJoinRoom = () => {
  return useMutation({
    mutationFn: ({ roomName, name }: JoinRoomForm): Promise<RoomResponse> => {
      return apiClient.post('/join-room', {
        roomName,
        name,
      })
    },
  })
}
