export const useParticipants = (
  participants: {
    id: number
  }[],
  me: { id: number } | null,
) => {
  const meAttending =
    me != null && participants.map(({ id }) => id).includes(me.id)
  return {
    count: participants.length,
    meAttending,
  }
}
