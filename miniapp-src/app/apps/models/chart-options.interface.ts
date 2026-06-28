import { ApexAxisChartSeries, ApexChart, ApexFill, ApexMarkers, ApexNonAxisChartSeries, ApexXAxis } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    xaxis: ApexXAxis;
    labels?: string[];
    chart: ApexChart;
    colors: string[];
    markers: ApexMarkers;
    fill: ApexFill;
};
