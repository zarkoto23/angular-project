import { Component } from '@angular/core';
import { ProductCard } from './product-card/product-card';
import { Laptop } from '../../../models/laptop.model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { LaptopService } from '../../../services/laptop.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [ProductCard, AsyncPipe,RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  products$: Observable<Laptop[]>;

  constructor(private laptopService: LaptopService) {
    this.products$ = this.laptopService.getLatestProducts(5);
  }
}
