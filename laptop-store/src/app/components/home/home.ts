import { Component, OnInit } from '@angular/core';
import { Products } from '../products/products';
import { SellSection } from '../sell-section/sell-section';
import { Laptop } from '../../models/laptop.model';
import { LaptopService } from '../../services/laptop.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [Products, SellSection, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  laptops: Laptop[] = [];

  constructor(private laptopService: LaptopService) {}

  ngOnInit(): void {
    this.loadLaptops();
  }

  loadLaptops() {
    this.laptopService.getAll().subscribe({
      next: (response) => {
        this.laptops = response.data || [];
        console.log('Заредени лаптопи:', this.laptops);
      },
    });
  }
}
