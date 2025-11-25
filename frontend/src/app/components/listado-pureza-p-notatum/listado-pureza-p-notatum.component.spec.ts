import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { createMockAuthService } from '../../testing/auth-service.helper';
import { ListadoPurezaPNotatumComponent } from './listado-pureza-p-notatum.component';

describe('ListadoPurezaPNotatumComponent', () => {
  let component: ListadoPurezaPNotatumComponent;
  let fixture: ComponentFixture<ListadoPurezaPNotatumComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [ListadoPurezaPNotatumComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { loteId: '1', reciboId: '1' }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPurezaPNotatumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
