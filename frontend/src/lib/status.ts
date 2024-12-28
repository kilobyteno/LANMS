// Utility functions for handling status variants
export function getEventStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'published':
      return 'success';
    case 'draft':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

export function getTicketStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'active':
      return 'success';
    case 'used':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}