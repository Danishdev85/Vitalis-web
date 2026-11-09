import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import SectionReveal from '../components/SectionReveal.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { getDepartments, getDoctors } from '../api/api.js';

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDept = searchParams.get('department') || '';

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Load departments once
  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  // Load doctors whenever the department filter changes
  useEffect(() => {
    setDoctorsLoading(true);
    getDoctors(activeDept || undefined)
      .then(setDoctors)
      .catch((err) => console.error('Failed to load doctors:', err))
      .finally(() => {
        setDoctorsLoading(false);
        setLoading(false);
      });
  }, [activeDept]);

  function selectDept(id) {
    if (id) setSearchParams({ department: id });
    else setSearchParams({});
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-offwhite py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionReveal>
            <span className="inline-block bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              Our Doctors
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-deepblue mb-4">
              Specialists You Can Trust
            </h1>
            <p className="text-deepblue/60 text-base lg:text-lg leading-relaxed">
              Every doctor at Vitalis is licensed, experienced, and ready to
              see you — often the same day.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Filter chips */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-10">
        <SectionReveal className="flex flex-wrap gap-2.5 justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => selectDept('')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !activeDept
                ? 'bg-teal text-white shadow-glow-teal'
                : 'bg-offwhite text-deepblue/70 shadow-neo-sm hover:shadow-neo'
            }`}
          >
            All Specialties
          </motion.button>
          {departments.map((dept) => (
            <motion.button
              key={dept.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectDept(String(dept.id))}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeDept === String(dept.id)
                  ? 'bg-teal text-white shadow-glow-teal'
                  : 'bg-offwhite text-deepblue/70 shadow-neo-sm hover:shadow-neo'
              }`}
            >
              {dept.name}
            </motion.button>
          ))}
        </SectionReveal>
      </section>

      {/* Doctors grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        {loading || doctorsLoading ? (
          <LoadingSpinner fullPage />
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-deepblue/50 font-medium">
              No doctors found in this department yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc, i) => (
              <DoctorCard key={doc.id} doctor={doc} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}