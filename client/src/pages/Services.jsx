import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import SectionReveal from '../components/SectionReveal.jsx';
import DepartmentCard from '../components/DepartmentCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { getDepartments } from '../api/api.js';

export default function Services() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((err) => console.error('Failed to load departments:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <section className="bg-offwhite py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionReveal>
            <span className="inline-block bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              Our Services
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-deepblue mb-4">
              Care Across Every Specialty
            </h1>
            <p className="text-deepblue/60 text-base lg:text-lg leading-relaxed mb-8">
              From routine checkups to focused specialist care — find the
              right department and book with a doctor in minutes.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="relative max-w-md mx-auto">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-deepblue/30 text-sm" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a department..."
                className="w-full neo-input pl-11"
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        {loading ? (
          <LoadingSpinner fullPage />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-deepblue/50 font-medium">
              No departments match "{query}".
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dept, i) => (
              <DepartmentCard key={dept.id} department={dept} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}