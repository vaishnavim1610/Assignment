import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { UserService, User } from '../../services/user.service';

Chart.register(
  ArcElement, Tooltip, Legend,
  LineElement, CategoryScale, LinearScale, PointElement
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  recentUsers: User[] = [];
  usersPerDay: { date: string; count: number }[] = [];


  lineChartData: ChartData<'line'> = { datasets: [], labels: [] };
  lineChartOptions: ChartOptions<'line'> = { responsive: true, plugins: { legend: { display: true } } };

  
  avatarChartData: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  avatarChartOptions: ChartOptions<'pie'> = { responsive: true, plugins: { legend: { display: true, position: 'bottom' } } };

 
  signupChartData: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  signupChartOptions: ChartOptions<'pie'> = { responsive: true, plugins: { legend: { display: true, position: 'bottom' } } };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.totalUsers = data.length;

      this.prepareUsersPerDay();
      this.prepareRecentUsers();
      this.prepareAvatarChart();
      this.prepareSignupChart();

      this.lineChartData = {
        labels: this.usersPerDay.map(d => d.date),
        datasets: [
          {
            label: 'Users per Day',
            data: this.usersPerDay.map(d => d.count),
            borderColor: '#2563eb',
            backgroundColor: '#93c5fd',
            fill: false,
            tension: 0.3,
          }
        ]
      };
    });
  }

  private prepareUsersPerDay() {
    const map: Record<string, number> = {};
    this.users.forEach(u => {
      if (u.createdAt) {
        const date = new Date(u.createdAt).toISOString().slice(0, 10);
        map[date] = (map[date] || 0) + 1;
      }
    });
    this.usersPerDay = Object.entries(map)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
  }

  private prepareRecentUsers() {
    this.recentUsers = [...this.users]
      .filter(u => u.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  private prepareAvatarChart() {
    const hasAvatar = this.users.filter(u => u.avatar).length;
    const noAvatar = this.users.length - hasAvatar;

    this.avatarChartData = {
      labels: ['Has Avatar', 'No Avatar'],
      datasets: [{
        data: [hasAvatar, noAvatar],
        backgroundColor: ['#4ade80', '#f87171']
      }]
    };
  }

  private prepareSignupChart() {
    const hours = Array(24).fill(0);
    this.users.forEach(u => {
      if (u.createdAt) {
        const h = new Date(u.createdAt).getHours();
        hours[h]++;
      }
    });

    this.signupChartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        data: hours,
        backgroundColor: Array.from({ length: 24 }, (_, i) => `hsl(${i*15},70%,50%)`)
      }]
    };
  }
}
