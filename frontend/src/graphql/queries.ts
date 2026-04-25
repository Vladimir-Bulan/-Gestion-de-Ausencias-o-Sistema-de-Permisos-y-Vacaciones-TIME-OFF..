import { gql } from '@apollo/client';

// ── Employees ──────────────────────────────────────────────
export const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id name email role managerId createdAt
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id name email role managerId
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id name email role managerId
    }
  }
`;

export const REMOVE_EMPLOYEE = gql`
  mutation RemoveEmployee($id: ID!) {
    removeEmployee(id: $id) {
      id name
    }
  }
`;

// ── Time Off Requests ───────────────────────────────────────
export const GET_TIME_OFF_REQUESTS = gql`
  query GetTimeOffRequests($filters: FilterRequestsInput) {
    timeOffRequests(filters: $filters) {
      id employeeId type startDate endDate totalDays
      reason status reviewedById reviewNote createdAt
      employee { id name email role }
    }
  }
`;

export const CREATE_TIME_OFF_REQUEST = gql`
  mutation CreateTimeOffRequest($input: CreateTimeOffRequestInput!) {
    createTimeOffRequest(input: $input) {
      id type status startDate endDate totalDays reason
    }
  }
`;

export const REVIEW_TIME_OFF_REQUEST = gql`
  mutation ReviewTimeOffRequest($input: ReviewRequestInput!) {
    reviewTimeOffRequest(input: $input) {
      id status reviewNote reviewedById
    }
  }
`;

export const CANCEL_TIME_OFF_REQUEST = gql`
  mutation CancelTimeOffRequest($requestId: ID!, $employeeId: ID!) {
    cancelTimeOffRequest(requestId: $requestId, employeeId: $employeeId) {
      id status
    }
  }
`;

// ── Leave Balance ───────────────────────────────────────────
export const GET_LEAVE_BALANCE = gql`
  query GetLeaveBalance($employeeId: ID!) {
    leaveBalance(employeeId: $employeeId) {
      id vacationDays sickDays personalDays year
    }
  }
`;
