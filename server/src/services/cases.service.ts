export type BusinessCase = {
  id: string;
  title: string;
  client: string;
  roi: string;
  payback: string;
  status: 'Active' | 'Planning' | 'Review';
};

// Placeholder service returning mocked data. Replace with DB queries later.
export function listCases(): BusinessCase[] {
  return [
    { id: '1', title: 'Digital Transformation Initiative', client: 'Acme Corporation', roi: '$2.1M', payback: '24 months', status: 'Active' },
    { id: '2', title: 'Cloud Migration Strategy', client: 'TechStart Inc', roi: '$850K', payback: '18 months', status: 'Planning' },
    { id: '3', title: 'Process Optimization Project', client: 'Global Manufacturing', roi: '$1.3M', payback: '30 months', status: 'Review' },
  ];
}

