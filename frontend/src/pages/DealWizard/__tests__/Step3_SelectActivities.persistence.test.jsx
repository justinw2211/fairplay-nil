import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Step3_SelectActivities from '../Step3_SelectActivities.jsx';

// Mock DealWizardStepWrapper to a simple passthrough to avoid importing recovery code
jest.mock('../../../components/DealWizardStepWrapper.jsx', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

// Mock useDeal to control currentDeal and capture updateDeal calls
jest.mock('../../../context/DealContext', () => ({
  useDeal: () => ({
    currentDeal: {
      id: 123,
      obligations: {
        'social-media': {
          sequence: 0,
          completed: true,
          description: 'Keep this',
          platforms: [{ platform: 'Instagram', type: 'Posts', quantity: 2 }],
        },
        'merch-and-products': {
          sequence: 1,
          completed: false,
          selectedTypes: ['jerseys'],
          details: { jerseys: { quantity: 10, price: 50 } },
        },
      },
    },
    updateDeal: jest.fn(),
  }),
}));

describe('Step3_SelectActivities persistence', () => {
  it('preserves existing activity data when re-saving selection', async () => {
    render(
      <MemoryRouter initialEntries={[`/add/deal/activities/select/123?type=simple`]}>
        <Routes>
          <Route path="/add/deal/activities/select/:dealId" element={<Step3_SelectActivities />} />
        </Routes>
      </MemoryRouter>
    );

    // Activities are pre-selected from currentDeal; do not toggle them off

    // Next button should be enabled
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeEnabled();

    // Click Next to trigger updateDeal
    fireEvent.click(nextBtn);

    // Verify updateDeal was called with merged obligations preserving existing fields
    const { useDeal } = jest.requireMock('../../../context/DealContext');
    const { updateDeal } = useDeal();

    expect(updateDeal).toHaveBeenCalled();
    const [_dealId, payload] = updateDeal.mock.calls.at(-1);

    expect(_dealId).toBe('123');
    expect(payload.obligations['social-media'].description).toBe('Keep this');
    expect(payload.obligations['social-media'].completed).toBe(true);
    expect(Array.isArray(payload.obligations['social-media'].platforms)).toBe(true);
    expect(payload.obligations['merch-and-products'].selectedTypes).toContain('jerseys');
    expect(payload.obligations['merch-and-products'].details?.jerseys?.quantity).toBe(10);
  });
});


