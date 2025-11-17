import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../../services/AuthService';
import { createMockAuthService } from '../../testing/auth-service.helper';
import { ListadoCultivosComponent } from './listado-cultivos.component';

describe('ListadoCultivosComponent', () => {
  let component: ListadoCultivosComponent;
  let fixture: ComponentFixture<ListadoCultivosComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [ListadoCultivosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoCultivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
