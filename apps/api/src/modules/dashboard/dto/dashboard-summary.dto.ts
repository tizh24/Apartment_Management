export class DashboardSummaryDto {
  totalApartments: number;

  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  reservedRooms: number;
  checkoutSoonRooms: number;
  maintenanceRooms: number;

  occupancyRate: number;

  totalMeterReadingAmount: number;
}