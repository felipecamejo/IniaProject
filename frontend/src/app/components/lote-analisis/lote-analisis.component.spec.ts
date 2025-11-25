import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LoteAnalisisComponent } from './lote-analisis.component';

describe('LoteAnalisisComponent', () => {
  let component: LoteAnalisisComponent;
  let fixture: ComponentFixture<LoteAnalisisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteAnalisisComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ loteId: '1', reciboId: '1' }),
            snapshot: {
              params: { loteId: '1', reciboId: '1' }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoteAnalisisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
