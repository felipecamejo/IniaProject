import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../../services/AuthService';
import { createMockAuthService } from '../../testing/auth-service.helper';
import { ListadoMalezasComponent } from './listado-malezas.component';

describe('ListadoMalezasComponent', () => {
  let component: ListadoMalezasComponent;
  let fixture: ComponentFixture<ListadoMalezasComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [ListadoMalezasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoMalezasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
