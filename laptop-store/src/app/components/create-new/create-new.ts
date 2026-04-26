import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LaptopData } from '../../models/laptop-data.model';
import { LaptopService } from '../../services/laptop.service';
import { ErrorModal } from '../static/error-modal/error-modal';

@Component({
  selector: 'app-create-new',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, ErrorModal],
  templateUrl: './create-new.html',
  styleUrl: './create-new.css',
})
export class CreateNew implements OnInit, OnDestroy {
  laptopForm = new FormGroup({
    brand: new FormControl('', [Validators.required, Validators.minLength(2)]),
    model: new FormControl('', [Validators.required, Validators.minLength(2)]),
    price: new FormControl(0, [Validators.required, Validators.min(1)]),
    operating_system: new FormControl('', Validators.required),
    processor: new FormControl('', [Validators.required, Validators.minLength(2)]),
    ram: new FormControl(0, [Validators.required, Validators.min(1)]),
    storage: new FormControl(0, [Validators.required, Validators.min(1)]),
    display_size: new FormControl(0, [Validators.required, Validators.min(1)]),
    backlight: new FormControl(null, Validators.required),
    class: new FormControl('', Validators.required),
    image_url: new FormControl(''),
    description: new FormControl(''),
  });

  showErrorModal: boolean = false;
  errorModalMessage: string = '';
  modalType: 'error' | 'success' = 'error';
  formSubmitted = false;

  private validOperatingSystems = [
    'Windows 11',
    'Windows 10',
    'Linux',
    'macOS',
    'ChromeOS',
    'FreeDOS',
    'Друга',
  ];

  private validClasses = ['Student', 'Business', 'Gaming', 'Premium', 'Друго'];

  constructor(
    private laptopService: LaptopService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.showErrorModal = false;
  }

  private resetForm(): void {
    this.showErrorModal = false;
    this.errorModalMessage = '';
    this.modalType = 'error';
    this.formSubmitted = false;
    this.cdr.detectChanges();

    this.laptopForm.reset({
      brand: '',
      model: '',
      price: 0,
      operating_system: '',
      processor: '',
      ram: 0,
      storage: 0,
      display_size: 0,
      backlight: null,
      class: '',
      image_url: '',
      description: '',
    });
  }

  get isFormValid(): boolean {
    return this.laptopForm.valid;
  }

  get brand() {
    return this.laptopForm.get('brand');
  }
  get model() {
    return this.laptopForm.get('model');
  }
  get price() {
    return this.laptopForm.get('price');
  }
  get operating_system() {
    return this.laptopForm.get('operating_system');
  }
  get processor() {
    return this.laptopForm.get('processor');
  }
  get ram() {
    return this.laptopForm.get('ram');
  }
  get storage() {
    return this.laptopForm.get('storage');
  }
  get display_size() {
    return this.laptopForm.get('display_size');
  }
  get backlight() {
    return this.laptopForm.get('backlight');
  }
  get classCtrl() {
    return this.laptopForm.get('class');
  }

  onSubmit() {
    this.formSubmitted = true;

    if (!this.laptopForm.valid) {
      this.showError('Моля, попълнете всички задължителни полета!');
      return;
    }

    const formValue = this.laptopForm.value;

    const osValue = formValue.operating_system || '';
    const validOS = this.validOperatingSystems.includes(osValue)
      ? (osValue as
          | 'Windows 11'
          | 'Windows 10'
          | 'Linux'
          | 'macOS'
          | 'ChromeOS'
          | 'FreeDOS'
          | 'Друга')
      : 'Друга';

    const classValue = formValue.class || '';
    const validClass = this.validClasses.includes(classValue)
      ? (classValue as 'Student' | 'Business' | 'Gaming' | 'Premium' | 'Друго')
      : 'Student';

    const laptopData: LaptopData = {
      brand: formValue.brand || '',
      model: formValue.model || '',
      price: formValue.price || 0,
      operating_system: validOS,
      processor: formValue.processor || '',
      ram: formValue.ram || 0,
      storage: formValue.storage || 0,
      display_size: formValue.display_size || 0,
      backlight: formValue.backlight || false,
      class: validClass,
      image_url: formValue.image_url || '',
      description: formValue.description || '',
      in_cart_to: [],
    };

    this.laptopService.create(laptopData).subscribe({
      next: (response) => {
        if (response.error) {
          this.showError(response.error.message || 'Грешка при създаване на обява', 'error');
        } else if (response.data) {
          this.showError('Обявата беше създадена успешно!', 'success');
        } else {
          this.showError('Нещо се обърка, опитай пак', 'error');
        }
      },
      error: (err) => {
        this.showError(`Възникна грешка: ${err.message || err}`, 'error');
      },
    });
  }

  private showError(message: string, type: 'error' | 'success' = 'error') {
    this.errorModalMessage = message;
    this.modalType = type;
    this.showErrorModal = true;
    this.cdr.detectChanges();
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorModalMessage = '';
    this.cdr.detectChanges();

    // if (this.modalType === 'success') {
    //   this.router.navigate(['/laptops']);
    // }
  }
}
