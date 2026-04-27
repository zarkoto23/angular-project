import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LaptopService } from '../../services/laptop.service';
import { Laptop } from '../../models/laptop.model';
import { ProductCard } from '../home/products/product-card/product-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-laptops',
  standalone: true,
  imports: [ProductCard, CommonModule],
  templateUrl: './laptops.html',
  styleUrls: ['./laptops.css']
})
export class LaptopsComponent {
  products$: Observable<Laptop[]>;

  constructor(private laptopService: LaptopService) {
    this.products$ = this.laptopService.getAll().pipe(
      map(response => response.data || [])
    );
  }
}