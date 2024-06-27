import { ApexAxisChartSeries, ApexChart, ApexFill, ApexMarkers, ApexXAxis } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    xaxis: ApexXAxis;
    chart: ApexChart;
    colors: string[];
    markers: ApexMarkers;
    fill: ApexFill;
};
