

Feature addition: Update the app to collect and handle the graduation year of user who is a student-athlete. 

In the sign up process, if a user says they are a student-athelete, please also ask for their Anticipated Graduation Year (this should be a question after "University" and before "Gender") during the sign up stage.

A user should have their graduation year displayed on their profile where it says "Class of TBD." TBD should be replaced with their graduation year. 

When a user edits their profile, they should be able to change their graduation year here. 

Please ensure that the database and backend is properly prepared to include this new information about a user.

## Implementation Details

### Database
- Field name: `expected_graduation_year`
- Type: INTEGER
- Validation: 2025 to 2035 (10 years from current year)
- Required: Only for student-athletes

### Frontend
- Format: 4-digit year (e.g., "2025")
- Display: "Class of 2025" or "Class of TBD" if not set
- Required: Yes for student-athletes during signup
- Location: After "University" field, before "Gender" field in signup flow

### Backend
- Add field to profile schema
- Add validation (2025-2035 range)
- Update profile endpoints to handle new field

### User Experience
- Student-athletes only (not for other user types)
- Existing users keep "Class of TBD" until manually updated
- No migration prompts for existing users
