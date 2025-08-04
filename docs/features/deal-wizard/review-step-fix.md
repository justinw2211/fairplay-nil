# Review Step Fix

**Date:** January 2025  
**Status:** Planning  
**Priority:** High  
**Affects:** All deal types

## Problem

Review step shows wrong data. Field names don't match backend schema.

## Issues

1. **Dates broken** - "Invalid Date - Invalid Date" shown
2. **Empty values** - "$0.00" total, missing payor/institution data  
3. **Wrong fields** - Frontend expects `deal.startDate` but backend has `deal.start_date`
4. **Compensation wrong** - Uses `deal.compensation.items` instead of `deal.compensation_cash`
5. **Missing constants** - `compensationTypes`, `paymentSchedules` not imported
6. **Wrong compliance** - Uses `deal.compliance` instead of `deal.obligations`
7. **Missing deal name** - No display of `deal.deal_nickname`
8. **Missing contact** - No display of contact info
9. **No edit navigation** - Sections not clickable to jump to edit steps

## Implementation Clarifications

### Error Handling
- **Scope**: Add try-catch blocks around ALL data access
- **Focus**: Date formatting, compensation calculations, field access
- **Fallbacks**: Provide meaningful default values for all fields

### Navigation Flow
- **Full Flow**: Implement complete navigation with parameter preservation
- **No Scroll Preservation**: Don't preserve scroll position on return
- **No Toast Notifications**: Don't show return notifications
- **No Section Highlighting**: Don't highlight edited sections

### Constants Import
- **Approach**: Import directly from Step6_Compensation.jsx
- **Constants**: `compensationTypes`, `paymentSchedules`
- **Avoid**: Circular dependencies by direct import

### Testing Strategy
- **Individual Testing**: Create specific test cases for each fix
- **Test Cases**: One test case per fix implementation
- **Validation**: Test data display, navigation, error handling

### DealContext Updates
- **Scope**: Update DealContext to handle new field names
- **Fields**: `compensation_cash` vs `compensation.items`
- **Schema**: Align with backend schema structure

## Fixes

### 1. Fix compensation calculation
```javascript
// Change from:
deal.compensation?.items?.reduce(...)

// To:
let total = 0;
if (deal.compensation_cash) total += parseFloat(deal.compensation_cash) || 0;
if (deal.compensation_goods) total += deal.compensation_goods.reduce(...);
if (deal.compensation_other) total += deal.compensation_other.reduce(...);
```

### 2. Fix date fields
```javascript
// Change from:
formatDate(deal.startDate) - formatDate(deal.endDate)

// To:
// Use endorsement duration as deal duration
const getDealDuration = () => {
  const endorsementData = deal.obligations?.endorsements;
  if (endorsementData?.duration) {
    return endorsementData.duration;
  }
  return 'Duration not specified';
};

// Display:
getDealDuration()
```

### 3. Fix payor fields
```javascript
// Change from:
deal.payorInfo?.name
deal.payorInfo?.type

// To:
deal.payor_name || 'Not specified'
deal.payor_type || 'Not specified'
```

### 4. Fix institution fields
```javascript
// Change from:
deal.school
deal.sport

// To:
deal.university || 'Not specified'
deal.sports?.join(', ') || 'Not specified'
```

### 5. Add validation
```javascript
const formatDate = (date) => {
  if (!date) return 'Not specified';
  try {
    return new Date(date).toLocaleDateString('en-US');
  } catch {
    return 'Invalid date';
  }
};
```

### 6. Import missing constants
```javascript
// Add to imports
import { compensationTypes, paymentSchedules } from './Step6_Compensation';
import { HelpCircle, Edit } from 'lucide-react';
```

### 7. Fix compensation display
```javascript
// Change from:
deal.compensation?.items.map(...)

// To:
{deal.compensation_cash && (
  <Text>Cash: {formatCurrency(deal.compensation_cash)}</Text>
)}
{deal.compensation_goods?.map((item, index) => (
  <Text key={index}>{item.description}: {formatCurrency(item.estimated_value)}</Text>
))}
```

### 8. Fix compliance display
```javascript
// Change from:
Object.entries(deal.compliance || {})

// To:
Object.entries(deal.obligations || {}).filter(([key, value]) => 
  key === 'uses_school_ip' || key === 'grant_exclusivity' || key === 'licenses_nil'
)
```

### 9. Add deal nickname
```javascript
<Text fontWeight="medium" color="brand.textSecondary">Deal Name</Text>
<Text color="brand.textPrimary">{deal.deal_nickname || 'Untitled Deal'}</Text>
```

### 10. Add contact info
```javascript
<Text fontWeight="medium" color="brand.textSecondary">Contact</Text>
<Text color="brand.textPrimary">{deal.contact_name || 'Not specified'}</Text>
<Text fontSize="sm" color="brand.textSecondary">{deal.contact_email || 'Not specified'}</Text>
```

### 11. Make sections clickable
```javascript
// Update SectionCard to accept onClick
const SectionCard = ({ title, icon: IconComponent, children, onClick }) => (
  <Card 
    variant="outline" 
    borderColor="brand.accentSecondary" 
    shadow="sm"
    onClick={onClick}
    cursor={onClick ? "pointer" : "default"}
    _hover={onClick ? { shadow: "md" } : {}}
  >
    <CardHeader borderBottom="1px" borderColor="brand.accentSecondary" bg="brand.backgroundLight" roundedTop="lg">
      <HStack spacing={3} justify="space-between">
        <HStack spacing={3}>
          <Box bg="brand.accentPrimary" p={2} rounded="lg">
            <Icon as={IconComponent} color="white" />
          </Box>
          <Heading size="md" color="brand.textPrimary">{title}</Heading>
        </HStack>
        {onClick && <Icon as={Edit} color="brand.textSecondary" boxSize={4} />}
      </HStack>
    </CardHeader>
    <CardBody bg="white">{children}</CardBody>
  </Card>
);

// Add edit buttons to accordion sections
<AccordionButton>
  <HStack flex="1">
    <Icon as={Calendar} />
    <Text fontWeight="semibold">Activities & Obligations</Text>
  </HStack>
  <AccordionIcon />
  <Button
    size="sm"
    variant="ghost"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/add/deal/activities/select/${dealId}?type=${dealType}`);
    }}
    leftIcon={<Icon as={Edit} />}
  >
    Edit
  </Button>
</AccordionButton>
```

## Tasks

- [ ] Update DealContext to handle new field names
- [ ] Fix compensation calculation in Step8_Review.jsx
- [ ] Use endorsement duration as deal duration
- [ ] Fix payor field names (payor_name, payor_type)
- [ ] Fix institution field names (university, sports)
- [ ] Import compensationTypes and paymentSchedules from Step6_Compensation.jsx
- [ ] Fix compensation display structure
- [ ] Fix compliance data source
- [ ] Add deal nickname display
- [ ] Add contact information display
- [ ] Add comprehensive error handling with try-catch blocks
- [ ] Make sections clickable for editing with full navigation flow
- [ ] Add visual edit indicators
- [ ] Create individual test cases for each fix
- [ ] Test all deal types

## Navigation Flow

When user clicks a section in review step:
1. Navigate to specific wizard step
2. User makes edits
3. User clicks "Next" to continue through wizard
4. Eventually returns to review step

Examples:
- Click "Parties" → Step 2 (Payor Info) → Edit → Next → Next → Next → Review
- Click "Compensation" → Step 6 (Compensation) → Edit → Next → Next → Review
- Click "Activities" → Step 3 (Select Activities) → Edit → Next → Next → Next → Next → Review

Navigation preserves:
- Deal type parameter (`?type={dealType}`)
- Deal ID parameter (`{dealId}`)
- Standard wizard progression (no step skipping)

## Files

- `frontend/src/pages/DealWizard/Step8_Review.jsx`
- `frontend/src/context/DealContext.jsx`
- `frontend/src/pages/DealWizard/Step6_Compensation.jsx` (for constants)

## Success

- Deal overview shows correct total value and deal name
- Deal duration shows endorsement duration or "Duration not specified"
- Payor, institution, and contact info shows correctly
- Compensation details display properly
- Compliance information shows correctly
- Sections are clickable to jump to edit steps with full navigation flow
- Visual edit indicators show which sections are editable
- Comprehensive error handling prevents crashes
- Individual test cases validate each fix
- No JavaScript errors
- Works for all deal types 