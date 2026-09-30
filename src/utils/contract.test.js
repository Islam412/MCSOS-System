import { describe, expect, it } from 'vitest'
import { validateDoctorAvailability, validateRoomAvailability } from './schedulingValidation'
import { getStatusColor, getCapacityIndicator } from './statusColors'
import { compressImage } from './imageCompressor'
import { restoreSessionPlacement } from './sessionPlacement'
import { getBilingualConflictMessage } from './conflictToastMessage'

describe('schedulingValidation', () => {
  const start = '2035-01-01T09:00:00.000Z'
  const end = '2035-01-01T10:00:00.000Z'

  it('rejects a doctor who already has an overlapping session', () => {
    const result = validateDoctorAvailability('doc-1', start, end, [
      { id: 's1', doctor_id: 'doc-1', session_date: start, end_time: end, status: 'SCHEDULED' },
    ])
    expect(result.isValid).toBe(false)
    expect(result.conflictSession.id).toBe('s1')
  })

  it('ignores a cancelled session and a different room', () => {
    const doctor = validateDoctorAvailability('doc-1', start, end, [
      { id: 's1', doctor_id: 'doc-1', session_date: start, end_time: end, status: 'CANCELLED' },
    ])
    const room = validateRoomAvailability('room-2', start, end, [
      { id: 's2', room_id: 'room-1', session_date: start, end_time: end, status: 'SCHEDULED' },
    ])
    expect(doctor.isValid).toBe(true)
    expect(room.isValid).toBe(true)
  })
})

describe('statusColors', () => {
  it('maps attended and missed onto the shared palette', () => {
    expect(getStatusColor('ATTENDED').key).toBe('completed')
    expect(getStatusColor('NO_SHOW').key).toBe('no_show')
  })

  it('turns a nearly full slot yellow and a full slot red', () => {
    expect(getCapacityIndicator(15, 20).color).toBe('yellow')
    expect(getCapacityIndicator(19, 20).color).toBe('red')
  })
})

describe('imageCompressor', () => {
  it('resolves an empty selection to an empty string', async () => {
    await expect(compressImage(null)).resolves.toBe('')
  })
})

describe('conflict toast and calendar revert', () => {
  it('joins the Arabic message before the English one', () => {
    expect(getBilingualConflictMessage({ apiMessage: { ar: 'تعارض', en: 'Conflict' } })).toBe('تعارض\nConflict')
  })

  it('puts the card back on the doctor, room, and time it left', () => {
    const previous = {
      doctor_id: 'doc-1',
      doctor: { id: 'doc-1', name: 'A' },
      room_id: 'room-1',
      room: { id: 'room-1' },
      session_date: '2035-01-01T09:00:00.000Z',
    }
    const moved = [{ id: 's1', doctor_id: 'doc-2', doctor: { id: 'doc-2' }, room_id: 'room-2', session_date: '2035-01-01T11:00:00.000Z' }]
    expect(restoreSessionPlacement(moved, 's1', previous)[0]).toMatchObject(previous)
  })
})
