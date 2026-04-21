// src/app/test-laptop/test-laptop.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaptopService } from '../../../core/services/laptop.service'; 
import { SupabaseService } from '../../../core/services/supabase.service'; 
import { Laptop } from '../../../shared/models/laptop.model'; 

@Component({
  selector: 'app-test-laptop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-w_idth: 800px; margin: 20px auto; padding: 20px; font-family: Arial;">
      <h1>Тест на LaptopService</h1>
      
      <!-- Текущ потребител -->
      <div style="background: #e3f2fd; padding: 10px; margin-bottom: 20px; border-radius: 8px;">
        <strong>Текущ потребител:</strong> 
        {{ (supabaseService.currentUsr$ | async)?.email || 'Не сте логнати' }}
        <button (click)="checkUser()" style="margin-left: 10px;">Провери</button>
      </div>
      
      <!-- Форма за създаване на лаптоп -->
      <div style="border: 1px sol_id #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h3>Създаване на лаптоп</h3>
        <input [(ngModel)]="newLaptop.brand" placeholder="Brand" style="margin: 5px; padding: 5px;">
        <input [(ngModel)]="newLaptop.model" placeholder="Model" style="margin: 5px; padding: 5px;">
        <input [(ngModel)]="newLaptop.price" type="number" placeholder="Price" style="margin: 5px; padding: 5px;">
        <input [(ngModel)]="newLaptop.processor" placeholder="Processor" style="margin: 5px; padding: 5px;">
        <input [(ngModel)]="newLaptop.ram" placeholder="RAM" style="margin: 5px; padding: 5px;">
        <input [(ngModel)]="newLaptop.storage" placeholder="Storage" style="margin: 5px; padding: 5px;">
        <br>
        <button (click)="createLaptop()" style="margin: 5px; padding: 5px 10px; background: #4CAF50; color: white; border: none;">📝 Създай</button>
      </div>
      
      <!-- Бутони за тестване -->
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
        <button (click)="getAll()" style="padding: 10px; background: #2196F3; color: white; border: none;">📋 Всички лаптопи</button>
        <button (click)="getOne()" style="padding: 10px; background: #2196F3; color: white; border: none;">🔍 Един лаптоп (_ID)</button>
        <button (click)="getOwned()" style="padding: 10px; background: #FF9800; color: white; border: none;">👤 Моите лаптопи</button>
        <button (click)="getInCart()" style="padding: 10px; background: #FF9800; color: white; border: none;">🛒 В количката</button>
        <button (click)="addToCart()" style="padding: 10px; background: #9C27B0; color: white; border: none;">➕ Добави в количка</button>
        <button (click)="removeFromCart()" style="padding: 10px; background: #9C27B0; color: white; border: none;">➖ Премахни от количка</button>
        <button (click)="updateLaptop()" style="padding: 10px; background: #607D8B; color: white; border: none;">✏️ Обнови лаптоп</button>
        <button (click)="deleteLaptop()" style="padding: 10px; background: #f44336; color: white; border: none;">🗑️ Изтрий лаптоп</button>
      </div>
      
      <!-- Поле за въвеждане на _ID -->
      <div style="margin-bottom: 20px;">
        <label>_ID на лаптоп: </label>
        <input [(ngModel)]="laptop_Id" placeholder="laptop-_id" style="w_idth: 300px; padding: 5px;">
      </div>
      
      <!-- Резултат -->
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border: 1px sol_id #ddd;">
        <h3>Резултат:</h3>
        <pre style="background: #fff; padding: 10px; overflow-x: auto;">{{ result | json }}</pre>
      </div>
      
      <!-- Грешка -->
      @if (error) {
        <div style="background: #ffebee; padding: 10px; margin-top: 10px; border-radius: 8px; color: #c62828;">
          <strong>Грешка:</strong> {{ error }}
        </div>
      }
    </div>
  `
})
export class TestLaptopComponent {
  private laptopService = inject(LaptopService);
  supabaseService = inject(SupabaseService);
  
  laptop_Id = '';
  result: any = null;
  error = '';
  
  newLaptop = {
    brand: 'Test',
    model: 'Model',
    price: 999,
    processor: 'Intel i7',
    ram: '16GB',
    storage: '512GB',
    displaySize: 15.6,
    operatingSystem: 'Windows 11',
    imageUrl: 'https://example.com/test.jpg',
    description: 'Test description'
  };

  // 1. ВСИЧКИ ЛАПТОПИ
  getAll() {
    this.clearResult();
    this.laptopService.getAll().subscribe({
      next: (data) => {
        this.result = { action: 'getAll()', data };
        console.log('✅ getAll:', data);
      },
      error: (err) => this.handleError('getAll', err)
    });
  }

  // 2. ЕДИН ЛАПТОП ПО _ID
  getOne() {
    if (!this.laptop_Id) {
      this.error = 'Моля, въведете _ID на лаптоп';
      return;
    }
    this.clearResult();
    this.laptopService.getOne(this.laptop_Id).subscribe({
      next: (data) => {
        this.result = { action: `getOne('${this.laptop_Id}')`, data };
        console.log(`✅ getOne(${this.laptop_Id}):`, data);
      },
      error: (err) => this.handleError('getOne', err)
    });
  }

  // 3. МОИТЕ ЛАПТОПИ (създадени от мен)
  getOwned() {
    this.clearResult();
    this.laptopService.owned().subscribe({
      next: (data) => {
        this.result = { action: 'owned()', data };
        console.log('✅ owned:', data);
      },
      error: (err) => this.handleError('owned', err)
    });
  }

  // 4. ЛАПТОПИТЕ В КОЛИЧКАТА
  getInCart() {
    this.clearResult();
    this.laptopService.inCart().subscribe({
      next: (data) => {
        this.result = { action: 'inCart()', data };
        console.log('✅ inCart:', data);
      },
      error: (err) => this.handleError('inCart', err)
    });
  }

  // 5. СЪЗДАВАНЕ НА ЛАПТОП
  createLaptop() {
    this.clearResult();
    this.laptopService.create(this.newLaptop).subscribe({
      next: (data) => {
        this.result = { action: 'create()', data };
        console.log('✅ create:', data);
        if (data?._id) {
          this.laptop_Id = data._id;
        }
      },
      error: (err) => this.handleError('create', err)
    });
  }

  // 6. ОБНОВЯВАНЕ НА ЛАПТОП
  updateLaptop() {
    if (!this.laptop_Id) {
      this.error = 'Моля, въведете _ID на лаптоп за обновяване';
      return;
    }
    this.clearResult();
    const updateData = {
      brand: 'Updated Brand',
      price: 9999
    };
    this.laptopService.update(this.laptop_Id, updateData).subscribe({
      next: (data) => {
        this.result = { action: `update('${this.laptop_Id}', ${JSON.stringify(updateData)})`, data };
        console.log(`✅ update(${this.laptop_Id}):`, data);
      },
      error: (err) => this.handleError('update', err)
    });
  }

  // 7. ДОБАВЯНЕ В КОЛИЧКАТА
  addToCart() {
    if (!this.laptop_Id) {
      this.error = 'Моля, въведете _ID на лаптоп за добавяне в количка';
      return;
    }
    this.clearResult();
    this.laptopService.addToCart(this.laptop_Id).subscribe({
      next: (data) => {
        this.result = { action: `addToCart('${this.laptop_Id}')`, data };
        console.log(`✅ addToCart(${this.laptop_Id}):`, data);
      },
      error: (err) => this.handleError('addToCart', err)
    });
  }

  // 8. ПРЕМАХВАНЕ ОТ КОЛИЧКАТА
  removeFromCart() {
    if (!this.laptop_Id) {
      this.error = 'Моля, въведете _ID на лаптоп за премахване от количка';
      return;
    }
    this.clearResult();
    this.laptopService.removeFromCart(this.laptop_Id).subscribe({
      next: (data) => {
        this.result = { action: `removeFromCart('${this.laptop_Id}')`, data };
        console.log(`✅ removeFromCart(${this.laptop_Id}):`, data);
      },
      error: (err) => this.handleError('removeFromCart', err)
    });
  }

  // 9. ИЗТРИВАНЕ НА ЛАПТОП
  deleteLaptop() {
    if (!this.laptop_Id) {
      this.error = 'Моля, въведете _ID на лаптоп за изтриване';
      return;
    }
    this.clearResult();
    this.laptopService.delete(this.laptop_Id).subscribe({
      next: (data) => {
        this.result = { action: `delete('${this.laptop_Id}')`, data };
        console.log(`✅ delete(${this.laptop_Id}):`, data);
      },
      error: (err) => this.handleError('delete', err)
    });
  }

  // 10. ПРОВЕРКА НА ПОТРЕБИТЕЛЯ
  checkUser() {
    this.supabaseService.getCurrentUser().subscribe(user => {
      console.log('👤 Текущ потребител:', user);
      this.result = { action: 'checkUser()', data: user };
    });
  }

  private clearResult() {
    this.result = null;
    this.error = '';
  }

  private handleError(action: string, err: any) {
    this.error = `${action}: ${err.message || err}`;
    console.error(`❌ ${action}:`, err);
  }
}