FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build_stage
WORKDIR /app
COPY . .
RUN dotnet publish src/HomeLabMonitoring.Api -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS run_stage

WORKDIR /app
COPY --from=build_stage /app/publish .
ENTRYPOINT ["dotnet", "HomeLabMonitoring.Api.dll"]