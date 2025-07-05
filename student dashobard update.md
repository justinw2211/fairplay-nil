## FEATURE:

Right now there is a add a new deal on a student-athlete's dashboard. It is time to update how this feature is used. There should be three functionalities for a student-athlete using this form that can be selected in their dashboard. 
	1. Simply log a deal to keep track of its state. There is no predictive analysis done. The deal is logged in the student-athlete's dashboard and they can tag it the different statuses (in negotiation, accepted, active, etc.)
	2. Determine if it will be approved by the NIL Go Clearinghouse
		a. If a user selects this, at the end of submitting their info through the deal form. They will have a result generated telling them if their deal will be approved, denied, or flagged by the NIL Go Clearinghouse. 
	3. Given parameters of an NIL Deal, what is the proper total compensation for the deal (low to high ranges)
		a. This is to help athletes, brands, collectives better negotiate to ensure they are getting good value for the deal
The user's results will include a deal range that represents Fair Market Value based on the composition of the deal and the athlete's profile


## EXAMPLES:

## DOCUMENTATION:

Use our Supabase MCP 
Use Task Master to organize your tasks from the PRP

## OTHER CONSIDERATIONS:

These three new functionalities should be able to be started from the student-athlete's dashboard. The results should be stored in their Submitted Deals section. For the 2nd and 3rd functionality, they should a way to easily see the result on the dashboard and a way to navigate to their complete result page. Dumb predictive are fine for right now. Focus on frontend functionality.