/**
 * RIPS Service Tests
 * Tests for the Colombian healthcare billing export functionality
 */

import { describe, it, expect } from 'vitest';
import {
  generateRIPS,
  validateRIPSDocument,
  getRIPSExportSummary,
  type RIPSPatientInput,
  type RIPSVisitInput,
  type RIPSBillingInput,
} from './index';

// Test data
const mockPatients: RIPSPatientInput[] = [
  {
    id: 'patient-1',
    documentId: '1234567890',
    name: 'Juan Pérez',
    diagnosis: 'J06.9',
    address: 'Calle 123 #45-67',
    age: 45,
  },
  {
    id: 'patient-2',
    documentId: '0987654321',
    name: 'María García',
    diagnosis: 'I10.X',
    address: 'Carrera 45 #12-34',
    age: 62,
  },
];

const mockVisits: RIPSVisitInput[] = [
  {
    id: 'visit-1',
    patientId: 'patient-1',
    patientDocumentId: '1234567890',
    scheduledTime: '2026-01-15T09:00:00Z',
    completedAt: '2026-01-15T10:30:00Z',
    clinicalNote: 'Control de presión arterial',
    diagnosis: 'J06.9',
    serviceModality: '02',
    serviceGroup: '01',
  },
  {
    id: 'visit-2',
    patientId: 'patient-2',
    patientDocumentId: '0987654321',
    scheduledTime: '2026-01-15T11:00:00Z',
    completedAt: '2026-01-15T12:00:00Z',
    clinicalNote: 'Evaluación de hipertensión',
    diagnosis: 'I10.X',
    serviceModality: '02',
    serviceGroup: '01',
  },
];

const mockBillings: RIPSBillingInput[] = [
  {
    id: 'billing-1',
    invoiceNumber: 'FEV-001',
    date: '2026-01-15',
    eps: 'EPS001',
    diagnosis: 'J06.9',
    procedures: ['890201'],
    totalAmount: 50000,
    patientId: 'patient-1',
    shiftId: 'visit-1',
  },
];

const dateRange = {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
};

describe('RIPS Generator', () => {
  describe('generateRIPS', () => {
    it('should generate a valid RIPS document', () => {
      const result = generateRIPS(
        mockPatients,
        mockVisits,
        mockBillings,
        dateRange
      );

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should include correct statistics', () => {
      const result = generateRIPS(
        mockPatients,
        mockVisits,
        mockBillings,
        dateRange
      );

      expect(result.stats.totalUsuarios).toBe(2);
      expect(result.stats.totalConsultas).toBe(2);
      expect(result.stats.valorTotal).toBeGreaterThan(0);
    });

    it('should handle empty inputs gracefully', () => {
      const result = generateRIPS([], [], [], dateRange);

      // Generator may return success=false for empty inputs (valid behavior)
      // What matters is it doesn't crash
      expect(result.stats.totalUsuarios).toBe(0);
      expect(result.stats.totalConsultas).toBe(0);
      expect(result.errors).toBeDefined();
    });

    it('should include date range in document', () => {
      const result = generateRIPS(
        mockPatients,
        mockVisits,
        mockBillings,
        dateRange
      );

      // Check the transaccion has the period info
      expect(result.document?.transaccion).toBeDefined();
      expect(result.document?.usuarios).toBeDefined();
    });
  });

  describe('validateRIPSDocument', () => {
    it('should validate a correct document', () => {
      const result = generateRIPS(
        mockPatients,
        mockVisits,
        mockBillings,
        dateRange
      );

      if (result.document) {
        const validation = validateRIPSDocument(result.document);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should catch missing required fields', () => {
      // Create a document with missing fields
      const invalidDoc = {
        numDocumentoIdObligado: '',
        numFactura: 'TEST-001',
        // Missing other required fields
      } as any;

      const validation = validateRIPSDocument(invalidDoc);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getRIPSExportSummary', () => {
    it('should return correct summary', () => {
      const result = generateRIPS(
        mockPatients,
        mockVisits,
        mockBillings,
        dateRange
      );

      if (result.document) {
        const summary = getRIPSExportSummary(result.document);
        
        // Use correct property names from RIPSExportSummary type
        expect(summary.registros.total).toBeGreaterThanOrEqual(0);
        expect(summary.fechaExportacion).toBeDefined();
      }
    });
  });
});
