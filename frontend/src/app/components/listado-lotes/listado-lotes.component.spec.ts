import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { createMockAuthService } from '../../testing/auth-service.helper';
import { ListadoLotesComponent } from './listado-lotes.component';

describe('ListadoLotesComponent', () => {
  let component: ListadoLotesComponent;
  let fixture: ComponentFixture<ListadoLotesComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [ListadoLotesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
