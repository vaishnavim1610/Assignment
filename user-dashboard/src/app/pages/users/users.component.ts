import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone:true,
  imports: [CommonModule, FormsModule, DatePipe]

})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  page = 1;
  pageSize = 10;
  searchTerm = '';
  sortField = 'name';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    let list = [...this.users];

    if (this.searchTerm) {
      list = list.filter(u =>
        (u.name?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (u.email?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    if (this.sortField === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sortField === 'date') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    this.filtered = list;
  }

  get paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
  return Math.ceil(this.filtered.length / this.pageSize);
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }


  changePage(p: number) {
    this.page = p;
  }
}
