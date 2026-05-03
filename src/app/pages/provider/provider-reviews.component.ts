import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { providerHistory } from '../../core/mock-data';

type DateFilter = 'ALL' | '30' | '90';
type SortFilter = 'newest' | 'oldest' | 'rating_high' | 'rating_low';

interface ProviderReview {
  id: string;
  service: string;
  customer: string;
  dateLabel: string;
  date: Date;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-provider-reviews',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './provider-reviews.component.html'
})
export class ProviderReviewsComponent {
  dateFilter: DateFilter = 'ALL';
  sortBy: SortFilter = 'newest';

  private readonly comments = [
    'Arrived quickly and solved the issue in one visit.',
    'Great communication and clear pricing before work started.',
    'Very professional service and clean finish.',
    'Helpful follow-up and excellent customer support.',
    'Work was completed faster than expected.'
  ];

  get reviews(): ProviderReview[] {
    const now = new Date();
    return providerHistory.map((entry, index) => {
      const date = new Date(`${entry.date}, ${now.getFullYear()}`);
      return {
        id: entry.id,
        service: entry.service,
        customer: `Customer ${index + 1}`,
        dateLabel: entry.date,
        date,
        rating: Number(entry.rating),
        comment: this.comments[index % this.comments.length]
      };
    });
  }

  get filteredReviews(): ProviderReview[] {
    const now = new Date();
    const days = Number(this.dateFilter);
    const threshold = new Date(now);
    if (this.dateFilter !== 'ALL') {
      threshold.setDate(now.getDate() - days);
    }

    const byDate = this.reviews.filter((review) => this.dateFilter === 'ALL' || review.date >= threshold);
    return byDate.sort((left, right) => {
      if (this.sortBy === 'newest') {
        return right.date.getTime() - left.date.getTime();
      }
      if (this.sortBy === 'oldest') {
        return left.date.getTime() - right.date.getTime();
      }
      if (this.sortBy === 'rating_high') {
        return right.rating - left.rating;
      }
      return left.rating - right.rating;
    });
  }

  get averageRating(): number {
    if (!this.filteredReviews.length) {
      return 0;
    }

    const total = this.filteredReviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / this.filteredReviews.length).toFixed(1));
  }

  get stars(): string {
    const filled = Math.round(this.averageRating);
    return `${'★'.repeat(filled)}${'☆'.repeat(Math.max(0, 5 - filled))}`;
  }

  setDateFilter(value: string): void {
    if (value === 'ALL' || value === '30' || value === '90') {
      this.dateFilter = value;
    }
  }

  setSort(value: string): void {
    if (value === 'newest' || value === 'oldest' || value === 'rating_high' || value === 'rating_low') {
      this.sortBy = value;
    }
  }

  reviewStars(rating: number): string {
    const filled = Math.round(rating);
    return `${'★'.repeat(filled)}${'☆'.repeat(Math.max(0, 5 - filled))}`;
  }
}
