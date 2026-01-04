'use client';

import { useState, useEffect, useRef } from 'react';
import { Participant, ParticipantFilters } from '@/types';
import Pagination from './Pagination';

interface ParticipantFilterProps {
  participants: Participant[];
  selectedParticipants: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onFilterChange: (filters: ParticipantFilters) => void;
}

export default function ParticipantFilter({
  participants,
  selectedParticipants,
  onSelectionChange,
  onFilterChange
}: ParticipantFilterProps) {
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    ageRange: { min: 0, max: 100 },
    searchQuery: ''
  });

  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>(participants);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const prevFiltersRef = useRef<ParticipantFilters>({
    gender: 'all',
    ageRange: { min: 0, max: 100 },
    searchQuery: ''
  });

  // Apply filters - separate effect for filtering
  useEffect(() => {
    let filtered = participants;

    // Gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    // Age range filter
    filtered = filtered.filter(p => 
      p.age >= filters.ageRange.min && p.age <= filters.ageRange.max
    );

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.phone_number.includes(query)
      );
    }

    setFilteredParticipants(filtered);
  }, [participants, filters]);

  // Reset pagination only when filters change
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.gender !== filters.gender ||
      prevFiltersRef.current.ageRange.min !== filters.ageRange.min ||
      prevFiltersRef.current.ageRange.max !== filters.ageRange.max ||
      prevFiltersRef.current.searchQuery !== filters.searchQuery;
    
    if (filtersChanged) {
      setCurrentPage(1);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleGenderChange = (gender: 'all' | 'L' | 'P') => {
    setFilters(prev => ({ ...prev, gender }));
  };

  const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      ageRange: { ...prev.ageRange, [field]: value }
    }));
  };

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredParticipants.map(p => p.uuid);
    const newSelection = [...new Set([...selectedParticipants, ...allFilteredIds])];
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const filteredIds = filteredParticipants.map(p => p.uuid);
    const newSelection = selectedParticipants.filter(id => !filteredIds.includes(id));
    onSelectionChange(newSelection);
  };

  const handleParticipantToggle = (participantId: string) => {
    const isSelected = selectedParticipants.includes(participantId);
    if (isSelected) {
      onSelectionChange(selectedParticipants.filter(id => id !== participantId));
    } else {
      onSelectionChange([...selectedParticipants, participantId]);
    }
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'L' ? 'Laki-Laki' : 'Perempuan';
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'L' ? '♂' : '♀';
  };

  const selectedCount = filteredParticipants.filter(p => selectedParticipants.includes(p.uuid)).length;
  const allSelected = filteredParticipants.length > 0 && selectedCount === filteredParticipants.length;

  // Pagination logic
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Peserta</h3>
        
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Peserta
          </label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama atau nomor telepon..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Kelamin
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleGenderChange('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                filters.gender === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleGenderChange('L')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                filters.gender === 'L'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <span>♂</span>
              <span>Laki-Laki</span>
            </button>
            <button
              onClick={() => handleGenderChange('P')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                filters.gender === 'P'
                  ? 'bg-pink-600 text-white'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              <span>♀</span>
              <span>Perempuan</span>
            </button>
          </div>
        </div>

        {/* Age Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rentang Umur
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min</label>
              <input
                type="number"
                value={filters.ageRange.min}
                onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max</label>
              <input
                type="number"
                value={filters.ageRange.max}
                onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value) || 100)}
                min="0"
                max="100"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Menampilkan {filteredParticipants.length} dari {participants.length} peserta
          {selectedCount > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({selectedCount} dipilih)
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            disabled={allSelected}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Pilih Semua
          </button>
          <button
            onClick={handleDeselectAll}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Batal Pilih Semua
          </button>
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="max-h-96 overflow-y-auto">
          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Tidak ada peserta yang sesuai dengan filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentParticipants.map((participant) => {
                const isSelected = selectedParticipants.includes(participant.uuid);
                return (
                  <div
                    key={participant.uuid}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleParticipantToggle(participant.uuid)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleParticipantToggle(participant.uuid)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {participant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              📱 {participant.phone_number}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getGenderIcon(participant.gender)}</span>
                            <span className="text-sm text-gray-500">
                              {getGenderLabel(participant.gender)}
                            </span>
                            <span className="text-sm text-gray-500">
                              • {participant.age} tahun
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredParticipants.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
