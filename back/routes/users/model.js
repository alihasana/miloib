import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import CalendarSchema from './../../schema/calendar'
import AppointmentSchema from './../../schema/appointment'
import SlotSchema from './../../schema/slot'


let UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'peon' },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  creationDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  // calendar: { eventsTypes: [], slots: [SlotSchema] },  // WARNING WIP !!!
  calendar: CalendarSchema,  // WARNING WIP !!!
  appointment: [AppointmentSchema]  // WARNING WIP !!!
})

UserSchema.methods.comparePasswords = function(reqPassword) {
  return bcrypt.compareSync(reqPassword, this.password)
}

export default mongoose.model('User', UserSchema)