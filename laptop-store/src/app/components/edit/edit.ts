import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LaptopData } from '../../models/laptop-data.model';
import { LaptopService } from '../../services/laptop.service';
import { ErrorModal } from '../static/error-modal/error-modal';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, ErrorModal],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class Edit implements OnInit, OnDestroy {
  laptopForm = new FormGroup({
    brand: new FormControl('', [Validators.required, Validators.minLength(2)]),
    model: new FormControl('', [Validators.required, Validators.minLength(2)]),
    price: new FormControl(0, [Validators.required, Validators.min(1)]),
    operating_system: new FormControl('', Validators.required),
    processor: new FormControl('', [Validators.required, Validators.minLength(2)]),
    ram: new FormControl(0, [Validators.required, Validators.min(1)]),
    storage: new FormControl(0, [Validators.required, Validators.min(1)]),
    display_size: new FormControl(0, [Validators.required, Validators.min(1)]),
    backlight: new FormControl<boolean>(false, Validators.required),
    class: new FormControl('', Validators.required),
    image_url: new FormControl(''),
    description: new FormControl(''),
  });

  showErrorModal: boolean = false;
  errorModalMessage: string = '';
  modalType: 'error' | 'success' = 'error';
  formSubmitted = false;
  isSubmitting = false;
  laptopId: string | null = null;
  isLoading = true;

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLaptopData();
  }

  ngOnDestroy(): void {
    this.showErrorModal = false;
  }

  private loadLaptopData(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.laptopId = params.get('id');
          return this.laptopService.getOne(this.laptopId!);
        }),
      )
      .subscribe({
        next: (response) => {
          if (response.error) {
            this.showError('Грешка при зареждане на лаптопа', 'error');
            this.router.navigate(['/laptops']);
          } else if (response.data) {
            this.populateForm(response.data.data);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showError(`Грешка: ${err.message || err}`, 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private populateForm(laptopData: LaptopData): void {
    this.laptopForm.patchValue({
      brand: laptopData.brand,
      model: laptopData.model,
      price: laptopData.price,
      operating_system: laptopData.operating_system,
      processor: laptopData.processor,
      ram: laptopData.ram,
      storage: laptopData.storage,
      display_size: laptopData.display_size,
      backlight: laptopData.backlight,
      class: laptopData.class,
      image_url: laptopData.image_url || '',
      description: laptopData.description || '',
    });

    this.formSubmitted = false;
    this.cdr.detectChanges();
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
    if (this.isSubmitting) {
      return;
    }

    this.formSubmitted = true;

    if (!this.laptopForm.valid) {
      this.showError('Моля, попълнете всички задължителни полета!');
      return;
    }

    this.isSubmitting = true;

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

    const updatedData: Partial<LaptopData> = {
      brand: formValue.brand || '',
      model: formValue.model || '',
      price: formValue.price || 0,
      operating_system: validOS,
      processor: formValue.processor || '',
      ram: formValue.ram || 0,
      storage: formValue.storage || 0,
      display_size: formValue.display_size || 0,
      backlight: formValue.backlight ?? false,
      class: validClass,
      image_url: formValue.image_url || '',
      description: formValue.description || '',
    };

    this.laptopService.edit(this.laptopId!, updatedData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.error) {
          this.showError(response.error.message || 'Грешка при редакция на обява', 'error');
        } else if (response.data) {
          this.showError('Обявата беше редактирана успешно!', 'success');
          setTimeout(() => {
            this.router.navigate(['/laptops', this.laptopId]);
          }, 1500);
        } else {
          this.showError('Нещо се обърка, опитай пак', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
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
  }

  cancel() {
    this.router.navigate(['/laptops', this.laptopId]);
  }
}
