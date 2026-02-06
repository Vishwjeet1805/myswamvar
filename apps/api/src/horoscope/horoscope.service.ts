import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BirthDetails {
  dob: Date;
  timeOfBirth?: string | null;
  placeOfBirth?: string | null;
  birthLatLong?: { lat: number; lng: number } | null;
}

export interface HoroscopeMatchResult {
  matchPercent: number;
  doshaResult: {
    mangalDosha: boolean;
    nadiDosha: boolean;
    bhakootDosha: boolean;
    summary: string;
  };
}

@Injectable()
export class HoroscopeService {
  private readonly logger = new Logger(HoroscopeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate horoscope match between two profiles
   * Returns cached result if available, otherwise calculates and caches
   */
  async getMatch(
    profileAId: string,
    profileBId: string,
  ): Promise<HoroscopeMatchResult | null> {
    // Ensure consistent ordering (smaller ID first)
    const [idA, idB] = [profileAId, profileBId].sort();
    if (idA === idB) {
      return null;
    }

    // Check cache first
    const cached = await this.prisma.horoscopeMatch.findUnique({
      where: {
        profileAId_profileBId: {
          profileAId: idA,
          profileBId: idB,
        },
      },
    });

    if (cached) {
      return {
        matchPercent: cached.matchPercent,
        doshaResult: cached.doshaResult as HoroscopeMatchResult['doshaResult'],
      };
    }

    // Get birth details for both profiles
    const [profileA, profileB] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { id: idA },
        select: {
          id: true,
          dob: true,
          timeOfBirth: true,
          placeOfBirth: true,
          birthLatLong: true,
        },
      }),
      this.prisma.profile.findUnique({
        where: { id: idB },
        select: {
          id: true,
          dob: true,
          timeOfBirth: true,
          placeOfBirth: true,
          birthLatLong: true,
        },
      }),
    ]);

    if (!profileA || !profileB) {
      return null;
    }

    // Check if both have required birth details
    if (!this.hasRequiredBirthDetails(profileA) || !this.hasRequiredBirthDetails(profileB)) {
      return null;
    }

    // Calculate match
    const result = this.calculateMatch(
      {
        dob: profileA.dob,
        timeOfBirth: profileA.timeOfBirth,
        placeOfBirth: profileA.placeOfBirth,
        birthLatLong: profileA.birthLatLong as { lat: number; lng: number } | null,
      },
      {
        dob: profileB.dob,
        timeOfBirth: profileB.timeOfBirth,
        placeOfBirth: profileB.placeOfBirth,
        birthLatLong: profileB.birthLatLong as { lat: number; lng: number } | null,
      },
    );

    // Cache the result
    try {
      await this.prisma.horoscopeMatch.create({
        data: {
          profileAId: idA,
          profileBId: idB,
          matchPercent: result.matchPercent,
          doshaResult: result.doshaResult,
        },
      });
    } catch (error) {
      // Ignore unique constraint errors (race condition)
      this.logger.warn(`Failed to cache horoscope match: ${error}`);
    }

    return result;
  }

  /**
   * Check if profile has required birth details for matching
   */
  private hasRequiredBirthDetails(profile: {
    dob: Date;
    timeOfBirth?: string | null;
    placeOfBirth?: string | null;
    birthLatLong?: unknown;
  }): boolean {
    return !!profile.dob && !!profile.timeOfBirth && !!profile.placeOfBirth;
  }

  /**
   * Calculate horoscope match percentage and dosha results
   * This is a simplified implementation. In production, you might want to:
   * 1. Integrate with an external astrology API (e.g., Prokerala, AstroAPI)
   * 2. Use a more sophisticated algorithm for nakshatra/rasi compatibility
   */
  private calculateMatch(
    birthA: BirthDetails,
    birthB: BirthDetails,
  ): HoroscopeMatchResult {
    // Basic implementation: calculate based on doshas and compatibility
    const doshaResult = this.calculateDoshas(birthA, birthB);
    const matchPercent = this.calculateMatchPercent(doshaResult);

    return {
      matchPercent,
      doshaResult,
    };
  }

  /**
   * Calculate doshas (Mangal, Nadi, Bhakoot)
   */
  private calculateDoshas(
    birthA: BirthDetails,
    birthB: BirthDetails,
  ): HoroscopeMatchResult['doshaResult'] {
    // Simplified dosha calculation
    // In production, use proper astrological calculations based on:
    // - Rasi (Moon sign)
    // - Nakshatra (constellation)
    // - Planetary positions

    const mangalDosha = this.checkMangalDosha(birthA, birthB);
    const nadiDosha = this.checkNadiDosha(birthA, birthB);
    const bhakootDosha = this.checkBhakootDosha(birthA, birthB);

    const doshaCount = [mangalDosha, nadiDosha, bhakootDosha].filter(Boolean).length;
    let summary = 'Good compatibility';
    if (doshaCount === 0) {
      summary = 'Excellent compatibility - No doshas found';
    } else if (doshaCount === 1) {
      summary = 'Good compatibility - Minor dosha present';
    } else if (doshaCount === 2) {
      summary = 'Moderate compatibility - Some doshas present';
    } else {
      summary = 'Low compatibility - Multiple doshas present';
    }

    return {
      mangalDosha,
      nadiDosha,
      bhakootDosha,
      summary,
    };
  }

  /**
   * Check for Mangal Dosha (Mars affliction)
   * Simplified: check if Mars is in certain houses
   */
  private checkMangalDosha(birthA: BirthDetails, birthB: BirthDetails): boolean {
    // Simplified logic: if both have Mars in certain positions, dosha exists
    // In production, use proper astrological calculations
    const marsPositionA = this.getMarsPosition(birthA);
    const marsPositionB = this.getMarsPosition(birthB);
    
    // Mangal dosha exists if Mars is in 1st, 2nd, 4th, 7th, 8th, or 12th house
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    const hasMangalA = mangalHouses.includes(marsPositionA);
    const hasMangalB = mangalHouses.includes(marsPositionB);
    
    // If both have Mangal dosha, it cancels out
    return hasMangalA && !hasMangalB || !hasMangalA && hasMangalB;
  }

  /**
   * Check for Nadi Dosha (pulse dosha)
   * Simplified: based on nakshatra groups
   */
  private checkNadiDosha(birthA: BirthDetails, birthB: BirthDetails): boolean {
    // Simplified: check if nakshatras are in same group
    // In production, use proper nakshatra calculations
    const nadiA = this.getNadiGroup(birthA);
    const nadiB = this.getNadiGroup(birthB);
    return nadiA === nadiB;
  }

  /**
   * Check for Bhakoot Dosha (moon sign compatibility)
   */
  private checkBhakootDosha(birthA: BirthDetails, birthB: BirthDetails): boolean {
    // Simplified: check moon sign compatibility
    // In production, use proper rasi calculations
    const rasiA = this.getRasi(birthA);
    const rasiB = this.getRasi(birthB);
    
    // Incompatible combinations (6th and 8th from each other)
    const incompatiblePairs = [
      [1, 6], [1, 8], [6, 1], [8, 1],
      [2, 7], [2, 9], [7, 2], [9, 2],
      [3, 8], [3, 10], [8, 3], [10, 3],
    ];
    
    return incompatiblePairs.some(([a, b]) => 
      (rasiA === a && rasiB === b) || (rasiA === b && rasiB === a)
    );
  }

  /**
   * Calculate match percentage based on doshas
   */
  private calculateMatchPercent(
    doshaResult: HoroscopeMatchResult['doshaResult'],
  ): number {
    let percent = 100;
    
    // Reduce percentage based on doshas
    if (doshaResult.mangalDosha) percent -= 5;
    if (doshaResult.nadiDosha) percent -= 10;
    if (doshaResult.bhakootDosha) percent -= 15;
    
    // Ensure minimum of 0
    return Math.max(0, Math.round(percent));
  }

  /**
   * Get Mars position (simplified - returns a house number 1-12)
   * In production, use proper astrological calculations
   */
  private getMarsPosition(birth: BirthDetails): number {
    // Simplified: use DOB to determine approximate Mars position
    const dayOfYear = Math.floor(
      (birth.dob.getTime() - new Date(birth.dob.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return (dayOfYear % 12) + 1;
  }

  /**
   * Get Nadi group (Adi, Madhya, Antya)
   * Simplified implementation
   */
  private getNadiGroup(birth: BirthDetails): string {
    // Simplified: use time of birth to determine nadi
    if (!birth.timeOfBirth) return 'Adi';
    const hour = parseInt(birth.timeOfBirth.split(':')[0] || '0', 10);
    if (hour < 8) return 'Adi';
    if (hour < 16) return 'Madhya';
    return 'Antya';
  }

  /**
   * Get Rasi (Moon sign) - simplified to return 1-12
   */
  private getRasi(birth: BirthDetails): number {
    // Simplified: use DOB to determine approximate rasi
    const month = birth.dob.getMonth();
    return (month % 12) + 1;
  }

  /**
   * Invalidate cached match when profile birth details are updated
   */
  async invalidateMatches(profileId: string): Promise<void> {
    await this.prisma.horoscopeMatch.deleteMany({
      where: {
        OR: [{ profileAId: profileId }, { profileBId: profileId }],
      },
    });
  }
}
