import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { createMockAuthService } from '../../testing/auth-service.helper';
import { DepositoComponent } from './deposito.component';

describe('DepositoComponent', () => {
  let component: DepositoComponent;
  let fixture: ComponentFixture<DepositoComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DepositoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepositoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
