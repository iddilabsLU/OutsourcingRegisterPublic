/**
 * Geographic Distribution Table
 * Data location and service performance jurisdiction analysis
 * CSSF Point 54.f - Location Information
 */

"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Globe2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getGeographicDistribution } from "@/lib/utils/dashboard-analytics"

interface GeographicDistributionTableProps {
  suppliers: SupplierOutsourcing[]
}

export function GeographicDistributionTable({ suppliers }: GeographicDistributionTableProps) {
  const geoData = getGeographicDistribution(suppliers)

  // State for View More toggles
  const [showDataLocationDetails, setShowDataLocationDetails] = useState(false)
  const [showServicePerfDetails, setShowServicePerfDetails] = useState(false)

  // State for expanded countries
  const [expandedDataCountries, setExpandedDataCountries] = useState<Set<string>>(new Set())
  const [expandedServiceCountries, setExpandedServiceCountries] = useState<Set<string>>(new Set())

  const toggleDataCountry = (country: string) => {
    const newSet = new Set(expandedDataCountries)
    if (newSet.has(country)) {
      newSet.delete(country)
    } else {
      newSet.add(country)
    }
    setExpandedDataCountries(newSet)
  }

  const toggleServiceCountry = (country: string) => {
    const newSet = new Set(expandedServiceCountries)
    if (newSet.has(country)) {
      newSet.delete(country)
    } else {
      newSet.add(country)
    }
    setExpandedServiceCountries(newSet)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-primary" />
          Geographic Distribution
        </CardTitle>
        <CardDescription>
          Data location countries and service performance jurisdictions (Point 54.f)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ============================================================================
            DATA LOCATION COUNTRIES SECTION
            ============================================================================ */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Data Location Countries</h4>

          {/* EU and Non-EU Indicator Cards */}
          <div className="grid gap-3 grid-cols-2">
            {/* EU Card */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  EU
                </Badge>
              </div>
              <div className="text-2xl font-bold">{geoData.euDataCount}</div>
              <div className="text-sm text-muted-foreground">
                suppliers ({geoData.euDataPercentage}%)
              </div>
            </div>

            {/* Non-EU Card */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Non-EU
                </Badge>
              </div>
              <div className="text-2xl font-bold">{geoData.nonEuDataCount}</div>
              <div className="text-sm text-muted-foreground">
                suppliers ({geoData.nonEuDataPercentage}%)
              </div>
            </div>
          </div>

          {/* View More Button */}
          {(geoData.euDataCountries.length > 0 || geoData.nonEuDataCountries.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowDataLocationDetails(!showDataLocationDetails)}
            >
              {showDataLocationDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  View More
                </>
              )}
            </Button>
          )}

          {/* Expanded Country List */}
          {showDataLocationDetails && (
            <div className="space-y-4 pt-2">
              {/* EU Countries Section */}
              {geoData.euDataCountries.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">EU Countries</h5>
                  <div className="space-y-1">
                    {geoData.euDataCountries.map(({ country, suppliers, count }) => (
                      <Collapsible
                        key={country}
                        open={expandedDataCountries.has(country)}
                        onOpenChange={() => toggleDataCountry(country)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between w-full p-2 rounded hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedDataCountries.has(country) ? "rotate-90" : ""
                                }`}
                              />
                              <span className="text-sm font-medium">{country}</span>
                              <span className="text-xs text-muted-foreground">({count} suppliers)</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-8 pr-2 py-2 flex flex-wrap gap-1">
                            {suppliers.map((supplier) => (
                              <Badge key={supplier} variant="secondary" className="text-xs">
                                {supplier}
                              </Badge>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-EU Countries Section */}
              {geoData.nonEuDataCountries.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">Non-EU Countries</h5>
                  <div className="space-y-1">
                    {geoData.nonEuDataCountries.map(({ country, suppliers, count }) => (
                      <Collapsible
                        key={country}
                        open={expandedDataCountries.has(country)}
                        onOpenChange={() => toggleDataCountry(country)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between w-full p-2 rounded hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedDataCountries.has(country) ? "rotate-90" : ""
                                }`}
                              />
                              <span className="text-sm font-medium">{country}</span>
                              <span className="text-xs text-muted-foreground">({count} suppliers)</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-8 pr-2 py-2 flex flex-wrap gap-1">
                            {suppliers.map((supplier) => (
                              <Badge key={supplier} variant="secondary" className="text-xs">
                                {supplier}
                              </Badge>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================================
            SERVICE PERFORMANCE COUNTRIES SECTION
            ============================================================================ */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Service Performance Countries</h4>

          {/* EU and Non-EU Indicator Cards */}
          <div className="grid gap-3 grid-cols-2">
            {/* EU Markets Card */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  EU
                </Badge>
              </div>
              <div className="text-2xl font-bold">{geoData.euServiceCount}</div>
              <div className="text-sm text-muted-foreground">
                suppliers ({geoData.euServicePercentage}%)
              </div>
            </div>

            {/* Non-EU Markets Card */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Non-EU
                </Badge>
              </div>
              <div className="text-2xl font-bold">{geoData.nonEuServiceCount}</div>
              <div className="text-sm text-muted-foreground">
                suppliers ({geoData.nonEuServicePercentage}%)
              </div>
            </div>
          </div>

          {/* View More Button */}
          {(geoData.euServiceCountries.length > 0 || geoData.nonEuServiceCountries.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowServicePerfDetails(!showServicePerfDetails)}
            >
              {showServicePerfDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  View More
                </>
              )}
            </Button>
          )}

          {/* Expanded Country List */}
          {showServicePerfDetails && (
            <div className="space-y-4 pt-2">
              {/* EU Markets Section */}
              {geoData.euServiceCountries.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">EU Markets</h5>
                  <div className="space-y-1">
                    {geoData.euServiceCountries.map(({ country, suppliers, count }) => (
                      <Collapsible
                        key={country}
                        open={expandedServiceCountries.has(country)}
                        onOpenChange={() => toggleServiceCountry(country)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between w-full p-2 rounded hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedServiceCountries.has(country) ? "rotate-90" : ""
                                }`}
                              />
                              <span className="text-sm font-medium">{country}</span>
                              <span className="text-xs text-muted-foreground">({count} suppliers)</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-8 pr-2 py-2 flex flex-wrap gap-1">
                            {suppliers.map((supplier) => (
                              <Badge key={supplier} variant="secondary" className="text-xs">
                                {supplier}
                              </Badge>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-EU Markets Section */}
              {geoData.nonEuServiceCountries.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">Non-EU Markets</h5>
                  <div className="space-y-1">
                    {geoData.nonEuServiceCountries.map(({ country, suppliers, count }) => (
                      <Collapsible
                        key={country}
                        open={expandedServiceCountries.has(country)}
                        onOpenChange={() => toggleServiceCountry(country)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between w-full p-2 rounded hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedServiceCountries.has(country) ? "rotate-90" : ""
                                }`}
                              />
                              <span className="text-sm font-medium">{country}</span>
                              <span className="text-xs text-muted-foreground">({count} suppliers)</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-8 pr-2 py-2 flex flex-wrap gap-1">
                            {suppliers.map((supplier) => (
                              <Badge key={supplier} variant="secondary" className="text-xs">
                                {supplier}
                              </Badge>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Service performance jurisdictions (Point 54.f)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
