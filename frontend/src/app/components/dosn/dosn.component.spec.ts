import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { createMockAuthService } from '../../testing/auth-service.helper';
import { DOSNComponent } from './dosn.component';

describe('DOSNComponent', () => {
  let component: DOSNComponent;
  let fixture: ComponentFixture<DOSNComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DOSNComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DOSNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
