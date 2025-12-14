export const useParticipantsCount = (
  participants: {
    id: string
  }[],
  me: { id: string } | null,
) => {
  const meAttending =
    me != null && participants.map(({ id }) => id).includes(me.id)
  return {
    count: participants.length,
    meAttending,
  }
}
