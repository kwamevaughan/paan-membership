// Custom hook for masterclasses management
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useMasterclasses = (filters = {}) => {
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchMasterclasses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/masterclasses?${params}`);
      const result = await response.json();

      if (response.ok) {
        setMasterclasses(result.data || []);
        setPagination(prev => result.pagination || prev);
      } else {
        setError(result.error || 'Failed to fetch masterclasses');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching masterclasses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMasterclasses();
  }, [fetchMasterclasses]);

  const createMasterclass = async (masterclassData) => {
    try {
      const response = await fetch('/api/masterclasses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(masterclassData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchMasterclasses(); // Refresh the list
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const updateMasterclass = async (id, updateData) => {
    try {
      const response = await fetch(`/api/masterclasses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchMasterclasses(); // Refresh the list
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const deleteMasterclass = async (id) => {
    try {
      const response = await fetch(`/api/masterclasses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMasterclasses(); // Refresh the list
        return { success: true };
      } else {
        const result = await response.json();
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  return {
    masterclasses,
    loading,
    error,
    pagination,
    fetchMasterclasses,
    createMasterclass,
    updateMasterclass,
    deleteMasterclass,
  };
};

export const useMasterclass = (id) => {
  const [masterclass, setMasterclass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMasterclass = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/masterclasses/${id}`);
      const result = await response.json();

      if (response.ok) {
        setMasterclass(result.data);
      } else {
        setError(result.error || 'Failed to fetch masterclass');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching masterclass:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMasterclass();
  }, [fetchMasterclass]);

  return {
    masterclass,
    loading,
    error,
    refetch: fetchMasterclass,
  };
};

export const useMasterclassRegistrations = (filters = {}) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/masterclasses/registrations?${params}`);
      const result = await response.json();

      if (response.ok) {
        setRegistrations(result.data || []);
        setPagination(prev => result.pagination || prev);
      } else {
        setError(result.error || 'Failed to fetch registrations');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const createRegistration = async (registrationData) => {
    try {
      const response = await fetch('/api/masterclasses/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchRegistrations(); // Refresh the list
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  return {
    registrations,
    loading,
    error,
    pagination,
    fetchRegistrations,
    createRegistration,
  };
};

export const useMasterclassCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/masterclasses/categories');
      const result = await response.json();

      if (response.ok) {
        setCategories(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (categoryData) => {
    try {
      const response = await fetch('/api/masterclasses/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchCategories(); // Refresh the list
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
  };
};

export const useMasterclassInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/masterclasses/instructors');
      const result = await response.json();

      if (response.ok) {
        setInstructors(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch instructors');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching instructors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const createInstructor = async (instructorData) => {
    try {
      const response = await fetch('/api/masterclasses/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instructorData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchInstructors(); // Refresh the list
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  return {
    instructors,
    loading,
    error,
    fetchInstructors,
    createInstructor,
  };
};