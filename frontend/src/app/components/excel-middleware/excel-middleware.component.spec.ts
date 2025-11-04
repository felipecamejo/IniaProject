import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelMiddlewareComponent } from './excel-middleware.component';

describe('ExcelMiddlewareComponent', () => {
  let component: ExcelMiddlewareComponent;
  let fixture: ComponentFixture<ExcelMiddlewareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelMiddlewareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelMiddlewareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
