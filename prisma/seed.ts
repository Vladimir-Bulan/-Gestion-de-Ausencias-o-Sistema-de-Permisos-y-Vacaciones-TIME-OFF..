import { PrismaClient, Role, LeaveType, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create manager
  const manager = await prisma.employee.upsert({
    where: { email: 'manager@wizdaa.com' },
    update: {},
    create: {
      name: 'Sarah Connor',
      email: 'manager@wizdaa.com',
      role: Role.MANAGER,
    },
  });

  // Create employees
  const alice = await prisma.employee.upsert({
    where: { email: 'alice@wizdaa.com' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@wizdaa.com',
      role: Role.EMPLOYEE,
      managerId: manager.id,
    },
  });

  const bob = await prisma.employee.upsert({
    where: { email: 'bob@wizdaa.com' },
    update: {},
    create: {
      name: 'Bob Smith',
      email: 'bob@wizdaa.com',
      role: Role.EMPLOYEE,
      managerId: manager.id,
    },
  });

  // Create leave balances
  const currentYear = new Date().getFullYear();

  await prisma.leaveBalance.upsert({
    where: { employeeId: alice.id },
    update: {},
    create: {
      employeeId: alice.id,
      vacationDays: 15,
      sickDays: 10,
      personalDays: 5,
      year: currentYear,
    },
  });

  await prisma.leaveBalance.upsert({
    where: { employeeId: bob.id },
    update: {},
    create: {
      employeeId: bob.id,
      vacationDays: 12,
      sickDays: 10,
      personalDays: 5,
      year: currentYear,
    },
  });

  await prisma.leaveBalance.upsert({
    where: { employeeId: manager.id },
    update: {},
    create: {
      employeeId: manager.id,
      vacationDays: 20,
      sickDays: 10,
      personalDays: 5,
      year: currentYear,
    },
  });

  // Create sample requests
  await prisma.timeOffRequest.createMany({
    data: [
      {
        employeeId: alice.id,
        type: LeaveType.VACATION,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        totalDays: 5,
        reason: 'Summer vacation',
        status: RequestStatus.PENDING,
      },
      {
        employeeId: bob.id,
        type: LeaveType.SICK,
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-11'),
        totalDays: 2,
        reason: 'Flu',
        status: RequestStatus.APPROVED,
        reviewedById: manager.id,
        reviewNote: 'Approved. Get well soon!',
      },
    ],
  });

  console.log('✅ Seed completed!');
  console.log(`  Manager: ${manager.email}`);
  console.log(`  Employee 1: ${alice.email}`);
  console.log(`  Employee 2: ${bob.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
